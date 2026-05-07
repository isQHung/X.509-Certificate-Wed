# Backend - Flask API Service

This service powers the X.509 certificate workflow. It is implemented with Flask and talks to Supabase, cryptography helpers, and the local certificate/key storage used by the project.

## What this service does

- Exposes the backend API for certificate requests, approvals, revocations, and related admin operations.
- Provides the health endpoint and API blueprint registration used by the frontend.
- Handles CORS for the browser app during local development.
- Uses crypto and database helpers to support certificate issuance logic.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flask 3.1.x |
| Database / API integration | Supabase Python client |
| Crypto | `cryptography` |
| JWT / auth helpers | `python-jose` |
| CORS | `flask-cors` |
| Testing | `pytest`, `pytest-asyncio` |

## Prerequisites

- Python 3.12 or newer
- `uv` installed locally

## Setup

1. Install dependencies.

   ```bash
   cd src/backend
   uv sync
   ```

2. Create the environment file.

   ```bash
   cp .env.example .env
   ```

3. Fill in the required variables.

   Common variables used by the service:

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

## Run Locally

```bash
uv run python main.py
```

The server listens on `http://localhost:5000` by default.

Useful commands:

```bash
uv run pytest
uv add <package-name>
uv remove <package-name>
```

## Runtime Notes

- `main.py` registers the API blueprint and exposes a `/health` endpoint.
- CORS is enabled for `/api/*` and defaults to `http://localhost:3000` as the allowed origin.
- The Flask dev server runs in debug mode when started through `main.py`.

## Project Structure

- `main.py` - Flask application entry point and health check
- `api/` - route blueprints, middleware, and v1 endpoints
- `core/` - business logic and crypto helpers
- `db/` - Supabase client and persistence helpers
- `schema/` - shared request/response and database models
- `secrets/` - local certificate/key placeholders for development
- `tests/` - unit and integration-style tests

## API Reference

High-level endpoint notes live in [api.md](api.md). Use that file for route summaries and payload examples while keeping this README focused on setup and service behavior.

## Testing

Run the local test suite with:

```bash
uv run pytest
```

If tests fail, first check that the environment variables above are present and that any Supabase-dependent tests have their dummy or local values configured.

## Troubleshooting

- If the service fails to start, check whether `.env` exists and contains the required Supabase and JWT values.
- If the frontend cannot call the API, confirm that the backend is running on port 5000 and that the frontend points to the same URL.
- If CORS errors appear in the browser, verify `CORS_ALLOW_ORIGIN` or the default origin in `main.py`.

## Related Docs

- [Frontend README](../frontend/README.md)
- [API notes](api.md)
- [Project requirements](../../docs/requirements/REAME.md)
- [Database design notes](../../docs/design/db-design/ER-spec.md)
