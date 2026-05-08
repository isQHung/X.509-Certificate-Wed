# Environment Variables Reference

This file documents the primary environment variables used by the backend and their purpose.

- `DATABASE_URL` — PostgreSQL connection string used by migration and runtime (format: `postgresql://user:pass@host:5432/dbname`).
- `KEY_PATH_CA` — Path to the Root CA private key file used by CRL and signing services.
- `CERT_PATH_CA` — Path to the Root CA certificate file used by signing services.
- `JWT_SECRET_KEY` — Secret used to sign/verify JWT access tokens (HS256).
- `RSA_KEY_SIZE` — Default RSA key size for root generation and other operations (e.g., 2048).
- `CA_VALIDITY_DAYS` — Default CA certificate validity period (days).
- `CA_ORG_NAME`, `CA_COUNTRY_NAME`, `CA_COMMON_NAME` — Defaults used when generating a Root CA from ENV.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase client configuration if used.

Security note: never commit environment files containing real secrets into version control. Use a secrets manager or environment injection at deploy time.
