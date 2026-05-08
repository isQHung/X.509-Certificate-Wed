# Documentation Index — X.509 CA Web System

This folder contains comprehensive documentation for the X.509 Certificate Authority (CA) web system.

## Quick links

### For operators / admins
- [DEPLOY.md](DEPLOY.md) — How to deploy using Docker Compose or standalone
- [USER_MANUAL.md](USER_MANUAL.md) — Common tasks (request certificates, revoke, approve requests)
- [MIGRATION.md](MIGRATION.md) — Database setup and migration steps
- [ENV.md](ENV.md) — Environment variable reference

### For developers
- [DEVELOPER.md](DEVELOPER.md) — Code organization, running tests, extending services
- [API.md](API.md) — REST API endpoint reference with examples
- [REPORT.md](REPORT.md) — **Complete technical report** with architecture, implementation details, security analysis, and theory

## Documentation files

| File | Purpose |
|---|---|
| [REPORT.md](REPORT.md) | **Main technical report** — architecture, background theory, implementation, security, conclusions |
| [USER_MANUAL.md](USER_MANUAL.md) | Step-by-step user guide for requesting and managing certificates |
| [DEVELOPER.md](DEVELOPER.md) | Developer guide: code structure, testing, extending |
| [API.md](API.md) | REST API endpoint reference with HTTP methods and examples |
| [DEPLOY.md](DEPLOY.md) | Deployment instructions (Docker Compose, local setup, production) |
| [MIGRATION.md](MIGRATION.md) | Database schema setup and migration procedure |
| [ENV.md](ENV.md) | Environment variables explanation and values |

## Key concepts

- **PKI (Public Key Infrastructure)** — Framework for managing digital certificates and keys.
- **X.509 certificates** — Digital certificates containing identity, public key, validity, and issuer signature.
- **CSR (Certificate Signing Request)** — Request containing subject public key and identity info, submitted to CA for signing.
- **CRL (Certificate Revocation List)** — Signed list of revoked certificate serial numbers published by the CA.
- **Root CA** — Self-signed certificate at the top of the trust chain; used to sign subordinate certificates.
- **JWT** — JSON Web Token used for authentication in this system (HS256 algorithm).

## Quick start checklist

1. Read [DEPLOY.md](DEPLOY.md) to set up the environment.
2. Read [MIGRATION.md](MIGRATION.md) to initialize the database.
3. For users: start with [USER_MANUAL.md](USER_MANUAL.md).
4. For developers: start with [DEVELOPER.md](DEVELOPER.md) and [API.md](API.md).
5. For security review: see [REPORT.md](REPORT.md) Security Analysis section.

## Support & references

- Python cryptography library: https://cryptography.io
- RFC 5280: https://tools.ietf.org/html/rfc5280 (X.509 specification)
- PostgreSQL: https://www.postgresql.org/
- Flask: https://flask.palletsprojects.com/
- Next.js: https://nextjs.org/

---

Generated: 2026-05-08  
For questions or updates, refer to the repository's issue tracker or documentation maintenance procedures.
