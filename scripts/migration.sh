#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$ROOT_DIR/db/migrations}"
MIGRATION_TABLE="${MIGRATION_TABLE:-public.schema_migrations}"
LOCK_FILE="${LOCK_FILE:-$ROOT_DIR/.migration.lock}"

DATABASE_URL="${DATABASE_URL:-${DB_URL:-}}"

require_db_env() {
  DATABASE_URL="${DATABASE_URL:-${DB_URL:-}}"
  if [[ -z "$DATABASE_URL" ]]; then
    cat <<'EOF'
DATABASE_URL (or DB_URL) is required.
Example:
  export DATABASE_URL='postgresql://user:password@host:5432/postgres'
EOF
    exit 1
  fi

  if ! command -v psql >/dev/null 2>&1; then
    echo "psql is required but not found in PATH." >&2
    exit 1
  fi
}

calc_checksum() {
  local file="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file" | awk '{print $1}'
  else
    echo "No SHA-256 tool found (sha256sum/shasum)." >&2
    exit 1
  fi
}

psql_q() {
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 "$@"
}

acquire_local_lock() {
  if ! command -v flock >/dev/null 2>&1; then
    echo "flock not found; continuing without local process lock." >&2
    return 0
  fi

  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    echo "Another migration process appears to be running (lock: $LOCK_FILE)." >&2
    exit 1
  fi
}

ensure_table() {
  psql_q <<SQL
CREATE TABLE IF NOT EXISTS $MIGRATION_TABLE (
  version        VARCHAR(50) PRIMARY KEY,
  description    TEXT NOT NULL,
  filename       TEXT NOT NULL,
  checksum       TEXT NOT NULL,
  status         VARCHAR(20) NOT NULL CHECK (status IN ('applied', 'undone', 'baselined', 'failed')),
  applied_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  undone_at      TIMESTAMPTZ,
  execution_ms   INTEGER,
  error_message  TEXT,
  applied_by     TEXT NOT NULL DEFAULT CURRENT_USER
);
SQL
}

usage() {
  cat <<'EOF'
Usage:
  ./scripts/migration.sh init
  ./scripts/migration.sh migrate
  ./scripts/migration.sh status
  ./scripts/migration.sh validate
  ./scripts/migration.sh undo [VERSION]
  ./scripts/migration.sh baseline <VERSION>

Commands:
  init      Create tracking table schema_migrations if not exists.
  migrate   Apply pending Vxxx__*.sql migrations in order.
  status    Show applied/undone/baselined migrations and pending files.
  validate  Check applied/baselined checksums against current files.
  undo      Undo latest applied migration or specified VERSION using Uxxx__*.sql.
  baseline  Mark all versions <= VERSION as baselined without executing SQL.
EOF
}

version_from_filename() {
  local file="$1"
  local base
  base="$(basename "$file")"
  if [[ "$base" =~ ^[VU]([0-9]{3})__([A-Za-z0-9_.-]+)\.sql$ ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    return 1
  fi
}

description_from_filename() {
  local file="$1"
  local base
  base="$(basename "$file")"
  if [[ "$base" =~ ^[VU][0-9]{3}__([A-Za-z0-9_.-]+)\.sql$ ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    return 1
  fi
}

apply_migration_file() {
  local version="$1"
  local description="$2"
  local file="$3"
  local checksum="$4"
  local start end elapsed

  start=$(date +%s%3N)
  if psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -1 -f "$file" >/dev/null; then
    end=$(date +%s%3N)
    elapsed=$((end - start))

    psql_q <<SQL
INSERT INTO $MIGRATION_TABLE (version, description, filename, checksum, status, applied_at, execution_ms, error_message, undone_at)
VALUES ('$version', '$description', '$(basename "$file")', '$checksum', 'applied', NOW(), $elapsed, NULL, NULL)
ON CONFLICT (version)
DO UPDATE SET
  description = EXCLUDED.description,
  filename = EXCLUDED.filename,
  checksum = EXCLUDED.checksum,
  status = 'applied',
  applied_at = NOW(),
  execution_ms = EXCLUDED.execution_ms,
  error_message = NULL,
  undone_at = NULL;
SQL
    echo "Applied V$version ($(basename "$file")) in ${elapsed}ms"
    return 0
  fi

  psql_q <<SQL
INSERT INTO $MIGRATION_TABLE (version, description, filename, checksum, status, applied_at, error_message)
VALUES ('$version', '$description', '$(basename "$file")', '$checksum', 'failed', NOW(), 'Migration execution failed')
ON CONFLICT (version)
DO UPDATE SET
  status = 'failed',
  error_message = 'Migration execution failed',
  applied_at = NOW();
SQL

  echo "Failed applying V$version ($(basename "$file"))" >&2
  return 1
}

cmd_init() {
  require_db_env
  acquire_local_lock
  ensure_table
  echo "Initialized migration table: $MIGRATION_TABLE"
}

cmd_migrate() {
  require_db_env
  acquire_local_lock
  ensure_table

  shopt -s nullglob
  local files=("$MIGRATIONS_DIR"/V[0-9][0-9][0-9]__*.sql)
  shopt -u nullglob

  if [[ ${#files[@]} -eq 0 ]]; then
    echo "No migration files found in $MIGRATIONS_DIR"
    return 0
  fi

  local file version description checksum row_count db_checksum db_status
  for file in "${files[@]}"; do
    version="$(version_from_filename "$file")" || {
      echo "Invalid migration filename: $(basename "$file")" >&2
      return 1
    }
    description="$(description_from_filename "$file")"
    checksum="$(calc_checksum "$file")"

    row_count="$(psql "$DATABASE_URL" -X -At -v ON_ERROR_STOP=1 -c "SELECT COUNT(*) FROM $MIGRATION_TABLE WHERE version = '$version';")"

    if [[ "$row_count" == "1" ]]; then
      db_checksum="$(psql "$DATABASE_URL" -X -At -v ON_ERROR_STOP=1 -c "SELECT checksum FROM $MIGRATION_TABLE WHERE version = '$version';")"
      db_status="$(psql "$DATABASE_URL" -X -At -v ON_ERROR_STOP=1 -c "SELECT status FROM $MIGRATION_TABLE WHERE version = '$version';")"

      if [[ "$db_checksum" != "$checksum" ]]; then
        echo "Checksum mismatch for V$version ($(basename "$file"))." >&2
        echo "Expected: $db_checksum" >&2
        echo "Current : $checksum" >&2
        return 1
      fi

      if [[ "$db_status" == "applied" || "$db_status" == "baselined" ]]; then
        echo "Skip V$version ($(basename "$file")) - already $db_status"
        continue
      fi
    fi

    apply_migration_file "$version" "$description" "$file" "$checksum" || return 1
  done

  echo "Migration completed."
}

cmd_status() {
  require_db_env
  ensure_table

  echo "== Applied History =="
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "SELECT version, status, filename, applied_at, undone_at FROM $MIGRATION_TABLE ORDER BY version;"

  echo
  echo "== Pending Files =="
  shopt -s nullglob
  local files=("$MIGRATIONS_DIR"/V[0-9][0-9][0-9]__*.sql)
  shopt -u nullglob

  local file version db_status
  local pending=0
  for file in "${files[@]}"; do
    version="$(version_from_filename "$file")" || continue
    db_status="$(psql "$DATABASE_URL" -X -At -v ON_ERROR_STOP=1 -c "SELECT status FROM $MIGRATION_TABLE WHERE version='$version';")"
    if [[ -z "$db_status" || "$db_status" == "undone" || "$db_status" == "failed" ]]; then
      echo "PENDING: $(basename "$file")"
      pending=1
    fi
  done

  if [[ "$pending" -eq 0 ]]; then
    echo "No pending migrations."
  fi
}

cmd_validate() {
  require_db_env
  ensure_table
  local failed=0

  while IFS='|' read -r version filename stored_checksum status; do
    local path="$MIGRATIONS_DIR/$filename"
    if [[ "$status" == "undone" || "$status" == "failed" ]]; then
      continue
    fi

    if [[ ! -f "$path" ]]; then
      echo "Missing file for V$version: $filename" >&2
      failed=1
      continue
    fi

    local current_checksum
    current_checksum="$(calc_checksum "$path")"
    if [[ "$current_checksum" != "$stored_checksum" ]]; then
      echo "Checksum mismatch for V$version: $filename" >&2
      failed=1
    fi
  done < <(psql "$DATABASE_URL" -X -At -F '|' -v ON_ERROR_STOP=1 -c "SELECT version, filename, checksum, status FROM $MIGRATION_TABLE ORDER BY version;")

  if [[ "$failed" -eq 1 ]]; then
    echo "Validation failed." >&2
    return 1
  fi

  echo "Validation passed."
}

cmd_undo() {
  require_db_env
  acquire_local_lock
  ensure_table

  local target_version="${1:-}"
  if [[ -z "$target_version" ]]; then
    target_version="$(psql "$DATABASE_URL" -X -At -v ON_ERROR_STOP=1 -c "SELECT version FROM $MIGRATION_TABLE WHERE status='applied' ORDER BY version DESC LIMIT 1;")"
    if [[ -z "$target_version" ]]; then
      echo "No applied migration found to undo." >&2
      return 1
    fi
  fi

  if [[ ! "$target_version" =~ ^[0-9]{3}$ ]]; then
    echo "Version must be in 3-digit format, e.g. 018" >&2
    return 1
  fi

  shopt -s nullglob
  local undo_files=("$MIGRATIONS_DIR"/U"$target_version"__*.sql)
  shopt -u nullglob

  if [[ ${#undo_files[@]} -ne 1 ]]; then
    echo "Expected exactly one undo file for version $target_version (U${target_version}__*.sql)." >&2
    return 1
  fi

  local undo_file="${undo_files[0]}"
  local start end elapsed
  start=$(date +%s%3N)

  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -1 -f "$undo_file" >/dev/null

  end=$(date +%s%3N)
  elapsed=$((end - start))

  psql_q <<SQL
UPDATE $MIGRATION_TABLE
SET status='undone', undone_at=NOW(), execution_ms=$elapsed, error_message=NULL
WHERE version='$target_version';
SQL

  echo "Undone V$target_version using $(basename "$undo_file") in ${elapsed}ms"
}

cmd_baseline() {
  require_db_env
  acquire_local_lock
  ensure_table

  local max_version="${1:-}"
  if [[ -z "$max_version" || ! "$max_version" =~ ^[0-9]{3}$ ]]; then
    echo "Usage: ./scripts/migration.sh baseline <VERSION>  (e.g. 018)" >&2
    return 1
  fi

  shopt -s nullglob
  local files=("$MIGRATIONS_DIR"/V[0-9][0-9][0-9]__*.sql)
  shopt -u nullglob

  local file version description checksum
  for file in "${files[@]}"; do
    version="$(version_from_filename "$file")" || continue
    if ((10#$version > 10#$max_version)); then
      continue
    fi

    description="$(description_from_filename "$file")"
    checksum="$(calc_checksum "$file")"

    psql_q <<SQL
INSERT INTO $MIGRATION_TABLE (version, description, filename, checksum, status, applied_at, error_message, undone_at)
VALUES ('$version', '$description', '$(basename "$file")', '$checksum', 'baselined', NOW(), NULL, NULL)
ON CONFLICT (version)
DO UPDATE SET
  description = EXCLUDED.description,
  filename = EXCLUDED.filename,
  checksum = EXCLUDED.checksum,
  status = CASE WHEN $MIGRATION_TABLE.status = 'applied' THEN 'applied' ELSE 'baselined' END,
  applied_at = CASE WHEN $MIGRATION_TABLE.status = 'applied' THEN $MIGRATION_TABLE.applied_at ELSE NOW() END,
  error_message = NULL;
SQL

    echo "Baselined V$version ($(basename "$file"))"
  done
}

main() {
  local cmd="${1:-}"
  case "$cmd" in
    init)
      cmd_init
      ;;
    migrate)
      cmd_migrate
      ;;
    status)
      cmd_status
      ;;
    validate)
      cmd_validate
      ;;
    undo)
      shift || true
      cmd_undo "$@"
      ;;
    baseline)
      shift || true
      cmd_baseline "$@"
      ;;
    ""|-h|--help|help)
      usage
      ;;
    *)
      echo "Unknown command: $cmd" >&2
      usage
      return 1
      ;;
  esac
}

main "$@"
