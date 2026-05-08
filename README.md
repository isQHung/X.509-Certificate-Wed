# X.509-Certificate-Wed

X.509-Certificate-Wed is a web-based system for issuing, managing, revoking, and tracking X.509 digital certificates.

## Overview

The project is organized as a full-stack application with:

- a Next.js frontend for customer and admin workflows,
- a Flask backend for certificate and revocation APIs,
- a PostgreSQL schema managed through SQL migrations,
- Supabase for auth/data integration,
- and Docker Compose for local orchestration.

The system supports the certificate lifecycle from CSR submission to approval, issuance, revocation, and CRL tracking.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16.1.7, React 19.2.3, TypeScript, Tailwind CSS 4, Supabase JS, Supabase SSR, Axios |
| Backend | Flask 3.1.x, Python 3.12+, Supabase Python client, `cryptography`, `python-jose`, `flask-cors` |
| Database | PostgreSQL, SQL migrations, views, triggers, stored functions |
| Testing | Playwright, pytest |
| Deployment | Docker Compose |

## Project Structure

```text
.
├── data/                   # Sample data and OpenSSL templates for local/demo use
├── db/                     # Database migrations, schema dump, SQL functions
├── docs/                   # Requirements, standards, design notes, drafts
├── scripts/                # Utility scripts
├── src/
│   ├── backend/            # Flask API, crypto helpers, backend tests
│   ├── frontend/           # Next.js application, UI, auth flow, frontend tests
│   └── shared/             # Shared schemas and helpers
├── docker-compose.yml      # Local multi-service startup
└── README.md               # Project overview and setup guide
```

## Architecture

```mermaid
flowchart LR
	U[User] --> F[Next.js Frontend]
	F -->|JWT/cookies + API calls| B[Flask Backend]
	B --> S[Supabase / PostgreSQL]
	B --> C[Certificate generation and revocation logic]
	C --> D[(Certs / CRL / audit data)]
```

## Core Workflows

- Customer registration and login
- Admin and customer dashboard access
- CSR creation and submission
- Admin approval or rejection of certificate requests
- Certificate issuance and download
- Revocation request and approval flow
- CRL generation and revocation tracking
- Audit log viewing and system configuration

## Requirements Summary

The system is designed for two main user groups:

- Admins manage root certificate setup, certificate requests, revocation requests, CRL updates, system configuration, and audit logs.
- Customers register, sign in, create key pairs and CSRs, request certificates, track certificate status, and request revocation.

## Local Setup

### Prerequisites

- Node.js 20+ and `pnpm`
- Python 3.12+ and `uv`
- Docker and Docker Compose

### 1. Frontend

```bash
cd src/frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

Frontend default URL: `http://localhost:3000`

### 2. Backend

```bash
cd src/backend
uv sync
cp .env.example .env
uv run python main.py
```

Backend default URL: `http://localhost:5000`

### 3. Docker Compose

**Before running Docker Compose, set the DATABASE_URL environment variable:**

```bash
cp .env.example .env
# Edit .env and add your actual password to DATABASE_URL
export $(cat .env | xargs)

docker compose up --build
```

Alternatively, pass DATABASE_URL directly:

```bash
DATABASE_URL='postgresql://postgres.ypgjagmfsksnvhhxtkfd:YOUR-PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres' docker compose up --build
```

This starts all services with the default ports mapped as:

- frontend: `3000`
- backend: `5000`

The migration service will run automatically before backend starts.

## Database Migrations

Schema migrations are managed with `scripts/migration.sh` and tracked in PostgreSQL table `public.schema_migrations`.

**Setup for local migration runs:**

```bash
# Set your Supabase connection (from .env or export directly)
export DATABASE_URL='postgresql://postgres.ypgjagmfsksnvhhxtkfd:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'

# Initialize migration metadata table
./scripts/migration.sh init

# Apply pending migrations
./scripts/migration.sh migrate

# Validate checksums and migration integrity
./scripts/migration.sh validate

# Show migration status and pending files
./scripts/migration.sh status

# Baseline existing DB up to a known version
./scripts/migration.sh baseline 018
```

For rollback, provide undo files with naming `U###__description.sql` and run:

```bash
./scripts/migration.sh undo
```

See full command reference in `scripts/README.md`.

## Environment Variables

### Frontend

Common required variables in `src/frontend/.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`
- `JWT_SECRET_KEY`
- `JWT_ACCESS_SECRET_KEY`
- `JWT_REFRESH_SECRET_KEY`

### Backend

Common required variables in `src/backend/.env`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET_KEY`
- `JWT_ACCESS_SECRET_KEY`
- `JWT_REFRESH_SECRET_KEY`
- `MASTER_KEY`
- `RSA_KEY_SIZE`
- `CA_VALIDITY_DAYS`
- `CA_ORG_NAME`
- `CA_COUNTRY_NAME`
- `CA_PRIVATE_KEY_PASSPHRASE`
- `ISSUER_CA`
- `KEY_PATH_CA`
- `CERT_PATH_CA`

## Development Commands

Frontend:

```bash
cd src/frontend
pnpm build
pnpm lint
pnpm test:e2e
```

Backend:

```bash
cd src/backend
uv run pytest
uv add <package-name>
uv remove <package-name>
```

## API and Database Docs

- [Frontend README](src/frontend/README.md)
- [Backend README](src/backend/README.md)
- [Backend API notes](src/backend/api.md)
- [Requirements](docs/requirements/REAME.md)
- [Database design notes](docs/design/db-design/ER-spec.md)

## Smoke Test

After starting both services, verify:

1. Frontend loads at `http://localhost:3000`.
2. Backend health endpoint responds at `http://localhost:5000/health`.
3. Frontend can reach the backend using `NEXT_PUBLIC_API_BASE_URL`.

## Notes

- Do not store real private keys in `data/samples/`.
- Use the SQL migrations in `db/migrations/` as the source of truth for schema changes.
- The root README is intentionally high-level; service-specific details live in the frontend and backend READMEs.

