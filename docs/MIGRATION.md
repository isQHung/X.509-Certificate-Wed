# Migration & Database Setup Guide

This document explains how to set up the database schema and run migrations.

## Prerequisites
- PostgreSQL instance (local, remote, or managed service)
- `psql` CLI tool installed and in PATH
- `bash` shell

## Environment setup

Create or update `src/backend/.env` with your database connection:

```bash
# src/backend/.env
DATABASE_URL='postgresql://<user>:<pass>@<host>:5432/<dbname>'
KEY_PATH_CA='./secrets/ca_key.pem'
CERT_PATH_CA='./secrets/ca_cert.pem'
JWT_SECRET_KEY='your-super-secret-key-change-this'
RSA_KEY_SIZE='2048'
CA_VALIDITY_DAYS='3650'
CA_ORG_NAME='My Organization'
CA_COUNTRY_NAME='US'
SUPABASE_URL='https://your-project.supabase.co'
SUPABASE_ANON_KEY='your-anon-key'
SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
```

## Running migrations manually

1. Set DATABASE_URL in your shell:

```bash
export DATABASE_URL='postgresql://<user>:<pass>@<host>:5432/<dbname>'
```

2. Run the migration script:

```bash
bash scripts/migration.sh migrate
```

Expected output (first run):

```
Migration tracking table created.
Applied: V001__extensions.sql
Applied: V002__types.sql
Applied: V003__users_roles.sql
Applied: V004__certificate_requests.sql
Applied: V005__certificates.sql
Applied: V006__revocations.sql
Applied: V007__crl.sql
Applied: V008__key_pairs.sql
Applied: V009__audit_logs.sql
Applied: V010__indexes.sql
Applied: V011__functions.sql
Applied: V012__triggers.sql
Applied: V013__seed_roles.sql
Applied: V014__system_configs.sql
Applied: V015__seed_system_configs.sql
Applied: V016__index_system_config.sql
Applied: V017__revocation_request.sql
Applied: V018__cert_request_options.sql
All migrations applied.
```

## Checking migration status

```bash
bash scripts/migration.sh status
```

## Schema overview

After migrations, the database will contain:

### Core tables
- `users` — user accounts with roles
- `roles` — admin, user roles
- `certificates` — issued X.509 certificates (PEM, serial, subject, validity)
- `certificate_requests` — pending CSR records
- `revocation_requests` — pending revocation requests
- `revocations` — applied revocations (records moved to CRL)
- `crl` — Certificate Revocation List headers and PEM
- `key_pairs` — user key metadata

### Audit tables
- `audit_logs` — audit trail of all admin actions

### System config
- `system_config` — system-wide settings

## Docker Compose approach

If using Docker Compose, the `db-migrate` service runs migrations automatically before starting the backend:

```bash
# from repo root
DATABASE_URL='postgresql://<user>:<pass>@<host>:5432/<dbname>' docker compose up --build
```

The migration completes, then backend and frontend services start on ports 5000 and 3000 respectively.

---

See `db/migrations/*.sql` for individual migration files and `db/schemas/` for complete schema definitions.
