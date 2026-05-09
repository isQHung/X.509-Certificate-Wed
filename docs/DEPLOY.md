# Deployment Guide — X.509 CA Web System

This guide explains how to deploy the system locally using Docker Compose, and the required environment configuration for a production-like setup.

## Prerequisites
- Docker
- Docker Compose (CLI integrated or standalone)
- A PostgreSQL instance accessible by the application (hosted or containerized)

## Environment variables
Key environment variables (set in `src/backend/.env` or exported before `docker compose up`):

- `DATABASE_URL` — PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/postgres`
- `KEY_PATH_CA` — Path to Root CA private key file inside backend container (e.g., `/app/secrets/ca_key.pem`)
- `CERT_PATH_CA` — Path to Root CA certificate file inside backend container
- `JWT_SECRET_KEY` — Secret for signing JWT tokens
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — if Supabase client is used to connect to DB

## Development start (recommended)

1. Copy `.env` example and edit `src/backend/.env`.

```bash
cp src/backend/.env.example src/backend/.env
# edit the env file
```

2. Start services with Docker Compose (migration runs first):

```bash
# from repo root
DATABASE_URL='postgresql://<user>:<pass>@<host>:5432/<dbname>' docker compose up --build
```

3. Backend: `http://localhost:5000` ; Frontend: `http://localhost:3000`.

## Running migrations (manual)
The project includes `scripts/migration.sh` which is invoked by the `db-migrate` service in `docker-compose.yml`. To run migrations manually against a DB, ensure `psql` utility is available and run the script with `migrate` argument.

```bash
# Example (requires psql configured)
sh scripts/migration.sh migrate
```

## Production considerations
- Use a managed DB service or a hardened Postgres cluster.
- Do not keep CA private keys in container images or in the repository. Use a secure file store, KMS, or mount an encrypted volume with strict access control.
- Configure TLS termination and ensure API endpoints are served over HTTPS.
- Use robust secret management for `JWT_SECRET_KEY` and database credentials.

---

End of deployment guide.
