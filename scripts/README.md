# Database Migration Script

This project uses a SQL-first migration runner at `scripts/migration.sh`.
The runner tracks applied versions in PostgreSQL table `public.schema_migrations` and prevents rerunning already-applied files.

## Requirements

- `psql` available in PATH
- `DATABASE_URL` (or `DB_URL`) environment variable
- Migration files in `db/migrations` with format:
  - Upgrade: `V###__description.sql`
  - Undo: `U###__description.sql`

## Commands

```bash
# Initialize tracking table
./scripts/migration.sh init

# Apply pending migrations
./scripts/migration.sh migrate

# Show applied history and pending files
./scripts/migration.sh status

# Verify checksums of applied/baselined migrations
./scripts/migration.sh validate

# Undo latest applied migration
./scripts/migration.sh undo

# Undo specific version
./scripts/migration.sh undo 018

# Baseline existing DB up to a version (without executing SQL)
./scripts/migration.sh baseline 018
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (required)
- `DB_URL`: fallback for `DATABASE_URL`
- `MIGRATIONS_DIR`: override migration directory (default: `db/migrations`)
- `MIGRATION_TABLE`: override tracking table (default: `public.schema_migrations`)
- `LOCK_FILE`: local lock file path (default: `.migration.lock`)

## CI/CD Suggested Flow

```bash
./scripts/migration.sh init
./scripts/migration.sh validate
./scripts/migration.sh migrate
```

For production, run on a controlled deployment step with secrets from your secret manager.
