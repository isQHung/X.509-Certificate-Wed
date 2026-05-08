<!--- Auto-generated technical documentation for the X.509 Certificate Authority project -->

# X.509 Certificate Authority (CA) Implementation — Technical Report

**Project title:** X.509 Certificate Authority (CA) Web System

**Technology stack:** Python (Flask), cryptography (cryptography.io), PostgreSQL (migrations + PL/pgSQL), Supabase client, Next.js (React), Docker / docker-compose

**Author:** [AUTHOR NAME]

**Date:** 2026-05-08

---

## ABSTRACT

This document is a comprehensive technical report for the X.509 Certificate Authority (CA) Web System implemented in this repository. It consolidates architecture, design, implementation details, security analysis, deployment instructions, API reference, and operator/developer guidance. The report is intended for developers, system operators, and security researchers who must understand, operate, or extend the system.

---

## ACKNOWLEDGEMENT

The author thanks the project contributors and maintainers for producing a clear repository layout and for including SQL migrations and sample artifacts that enabled accurate reverse engineering of the certificate lifecycle and PKI operations.

---

## INTRODUCTION

Problem statement
- Enterprisewide systems and test labs require a private Certificate Authority to issue, manage, and revoke X.509 certificates. This project implements a CA service exposing web APIs and a frontend for certificate lifecycle management.

Objectives
- Provide a web-accessible CA capable of creating keys and CSRs, signing CSRs into X.509 certificates, publishing CRLs, and supporting revocation workflows with administrative approval and audit logging.

Scope
- The scope covers the full-stack implementation in this repository: backend services (Flask/Python), database schema and PL/pgSQL functions, cryptographic operations using the Python `cryptography` library, Next.js frontend, and Docker-based deployment.

Motivation
- Centralized private PKI for internal services, tooling, and educational purposes. The implementation demonstrates practical PKI operations, secure key handling patterns, and revocation mechanisms.

---

## BACKGROUND THEORY

This section briefly covers the cryptographic and PKI concepts referenced through the implementation.

- Public Key Infrastructure (PKI): PKI provides the services needed to bind public keys to identities using digital certificates, manage lifecycle, and provide revocation and trust validation.
- X.509 certificates: ASN.1-encoded structures containing subject, issuer, public key, validity, extensions (e.g., SAN, KeyUsage, BasicConstraints), and a signature over the certificate fields.
- Digital signatures: Asymmetric cryptography operation (RSA/ECDSA) over the certificate's TBS (To-Be-Signed) structure, typically using SHA-2 family hashes.
- Hashing: SHA-256 is used for integrity and as the digest algorithm for certificate signatures in this project.
- RSA/ECC: RSA is the primary algorithm implemented; the repository supports RSA and EC key generation paths for CSRs and key pairs.
- TLS/SSL: Certificates issued by the CA can be used in TLS endpoints; trust chains are formed by trusting the Root CA certificate.
- CA hierarchy: Root CA is self-signed (subject == issuer) and signs subordinate certificates.
- CSR (Certificate Signing Request): A PKCS#10 structure containing subject and public key, signed by the requester's private key.
- CRL (Certificate Revocation List): A signed list of revoked certificate serial numbers and revocation times, produced and signed by the CA private key.
- OCSP: Online Certificate Status Protocol is not implemented in this repository (CRL-based revocation is used).

---

## SYSTEM ARCHITECTURE

High-level architecture

```mermaid
flowchart LR
  subgraph Frontend
    FE[Next.js UI]
  end

  subgraph Backend
    API[Flask API]
    Services[Core services: CSR, KeyGen, Signer, Revocation, CRL]
    Crypto[cryptography library]
  end

  subgraph Database
    DB[(Postgres / Supabase)]
  end

  FE -->|HTTPS / API| API
  API --> Services
  Services --> Crypto
  Services --> DB
  API --> DB
```

Components
- Frontend: `src/frontend` — Next.js application used by operators and users to request CSRs, create key pairs, view certificates and CRLs.
- Backend API: `src/backend` — Flask application exposing versioned API endpoints under `/api`.
- Core services: `src/backend/core/services/*` — business logic for CSR generation, key generation, signing, revocation, CRL generation, and audit events.
- Crypto layer: `src/backend/core/crypto/*` — cryptographic primitives and signing (RSA, AES utilities), and `cert_signer.py` that performs X.509 certificate creation.
- Database: PostgreSQL with migration files under `db/migrations` and table definitions under `db/schemas`.
- Containerization: `docker-compose.yml` and Dockerfiles in `src/backend` and `src/frontend`.

Certificate workflow (summary)
1. User or frontend creates a CSR (see `src/backend/core/services/csr_generator.py`).
2. CSR is stored as a certificate request record and awaits approval.
3. Admin approves a request using approval APIs; approved requests are signed by the CA (`cert_signer.py`) to produce a PEM certificate.
4. Issued certificate and metadata are stored in `certificates` table; `key_pairs` table manages user key metadata.
5. Revocation requests are created or admins can directly revoke; revocations populate `revocations` and are moved into CRL entries during CRL generation.

---

## PROJECT STRUCTURE

Top-level folders (important ones)

- `src/backend` — Flask backend application, core services, API blueprints, tests, and Dockerfile.
- `src/frontend` — Next.js frontend application.
- `db` — SQL migrations, schemas, functions, triggers, views, and seed SQL.
- `data` — sample data and certificate templates.
- `scripts` — migration helper scripts.

Key files explained (representative list)

- Backend entry: [src/backend/main.py](src/backend/main.py#L1-L40) — Flask app factory, CORS, and blueprint registration.
- API routes: [src/backend/api/routes.py](src/backend/api/routes.py#L1-L120) — central router that applies authentication middleware and registers blueprints.
- Cert signer: [src/backend/core/crypto/cert_signer.py](src/backend/core/crypto/cert_signer.py#L1-L120) — wraps `cryptography.x509` certificate builder and signs CSRs.
- RSA service: [src/backend/core/crypto/RSA.py](src/backend/core/crypto/RSA.py#L1-L200) — key generation, root CA creation, serialization utilities.
- CSR generation: [src/backend/core/services/csr_generator.py](src/backend/core/services/csr_generator.py#L1-L200) — creates CSRs and inserts request records.
- Revocation service: [src/backend/core/services/revocation_service.py](src/backend/core/services/revocation_service.py#L1-L240) — handles approval/rejection workflows and direct revocation.
- CRL service: [src/backend/core/services/crl.py](src/backend/core/services/crl.py#L1-L240) — composes and signs CRLs from revocation records.
- DB functions: `db/functions/generate_crl.sql` and `db/functions/revoke_certificate.sql` — lightweight PL/pgSQL helpers that integrate with the database schema.

---

## IMPLEMENTATION DETAILS

Certificate issuance

The certificate signing flow (high-level):

1. CSR creation (frontend -> `csr_generator.generate_csr`). The service builds an X.509 `CertificateSigningRequest` using user-supplied subject fields and optional SAN values. Example snippet:

```py
# from src/backend/core/services/csr_generator.py
csr = csr_builder.sign(private_key, hashes.SHA256())
csr_pem = csr.public_bytes(serialization.Encoding.PEM).decode("utf-8")
```

2. CSR storage: CSR and metadata are saved into the `certificate_requests` table via repository layer `core.repository.cert_request`.

3. Approval + signing: An admin uses the approval API (blueprint `approve`) which, when approved, calls the signing service. The CA private key and certificate are loaded from configured paths (`KEY_PATH_CA`, `CERT_PATH_CA`) and the CSR is signed.

4. The signer uses SHA-256 digest and RSA signing (see `src/backend/core/crypto/cert_signer.py`):

```py
# from src/backend/core/crypto/cert_signer.py
certificate = builder.sign(private_key=self.root_key, algorithm=hashes.SHA256())
return certificate.public_bytes(serialization.Encoding.PEM)
```

Key generation

- Key pairs for users and for the CA are generated using RSA or EC primitives from `cryptography.hazmat.primitives`.
- Example: `RSACAService.generate_key_pair()` uses `rsa.generate_private_key` with configurable key size (env var `RSA_KEY_SIZE`).

Signing process

- The certificate builder sets `serial_number`, `subject`, `issuer` (CA subject), `not_valid_before`, `not_valid_after`, `public_key` from CSR, and extensions such as `KeyUsage` and `SubjectAlternativeName` when provided in the CSR.
- The final certificate is produced by calling `builder.sign(private_key=ca_private_key, algorithm=hashes.SHA256())`.

Verification process

- The backend exposes a `certificate_inspector` API to parse certificates and validate signature/fields using `cryptography.x509` parsing helpers.

Revocation

- Revocations are represented in `revocations` table. Administrators can approve revocation requests through an approval workflow (`revocation_requests` table) or perform direct revocation (`revocation_service.revoke_certificate_by_serial`).
- The CRL generation process is implemented in `src/backend/core/services/crl.py`, which:
  - Loads Root CA key and cert from `KEY_PATH_CA` and `CERT_PATH_CA`.
  - Aggregates revocation rows and existing CRL entries, de-duplicates by serial, and builds an X.509 CRL using `cryptography.x509.CertificateRevocationListBuilder()`.
  - Signs the CRL with CA private key using SHA-256.

Code excerpt — CRL builder (simplified):

```py
builder = (
    x509.CertificateRevocationListBuilder()
    .issuer_name(ca_cert.issuer)
    .last_update(now)
    .next_update(next_up)
)
for row in entry_rows:
    revoked = (x509.RevokedCertificateBuilder()
        .serial_number(serial_int)
        .revocation_date(revoked_at)
        .build())
    builder = builder.add_revoked_certificate(revoked)
crl = builder.sign(private_key=ca_private_key, algorithm=hashes.SHA256())
```

APIs / Endpoints

The API routing is organized under `src/backend/api/v1/` with blueprints for:

- `cert_request` — request CSR creation endpoints
- `certificates` — issued certificate listing and retrieval
- `key_generator` — generate key pairs for users
- `approve` — admin approval flows for certificate issuance and revocation
- `crl` — generate and fetch latest CRL
- `root_ca` — endpoints to create or import Root CA artifacts (admin only)

The global route initialization is in [src/backend/api/routes.py](src/backend/api/routes.py#L1-L120). Authentication middleware (`jwt_middleware`) runs before processing requests and enforces admin-only access for selected blueprints.

Authentication & Authorization

- Authentication uses JWT tokens (HS256) with `JWT_SECRET_KEY` (see `src/backend/api/jwt_utils.py`). The middleware reads `session_token` cookie or Authorization header to decode payloads and set user context on the `request` object.
- Authorization checks roles; admin-only blueprints are blocked for non-admin roles by the router. Users may be created and assigned roles in `roles` table and `users` table.

Database schema

Important tables (files under `db/schemas/tables`) — summarized:

| Table | Purpose | Important columns |
|---|---:|---|
| `certificates` | Issued certificate records | `id`, `serial_number`, `issuer_id`, `subject` (JSONB), `san` (JSONB), `public_key`, `valid_from`, `valid_to`, `status`, `certificate_pem` |
| `key_pairs` | User key metadata | `id`, `owner_id`, `alias`, `key_type`, `key_size`, `fingerprint` |
| `revocations` | Revoked certificates awaiting CRL | `id`, `certificate_id`, `serial_number`, `reason`, `revoked_at` |
| `crl` | CRL headers and PEM | `id`, `version`, `generated_at`, `next_update`, `crl_pem` |

References to table definitions:
- [db/schemas/tables/certificates.sql](db/schemas/tables/certificates.sql#L1-L40)
- [db/schemas/tables/key_pairs.sql](db/schemas/tables/key_pairs.sql#L1-L40)
- [db/schemas/tables/revocations.sql](db/schemas/tables/revocations.sql#L1-L40)

Security mechanisms

- Cryptography: All signing operations use `cryptography`'s `x509` builders and SHA-256. RSA key generation with configurable key sizes and EC support are implemented.
- Key material: Root CA credentials are expected to be stored as files on the host and referenced by environment variables `KEY_PATH_CA` and `CERT_PATH_CA`. The repository includes `secrets/*.example` files, which are examples only.
- Auditing: The system records audit events (see `core.services.audit_event`) on important actions such as revocation and CRL creation.

---

## TECHNOLOGIES USED

- Python + Flask: Lightweight API server with existing code and tests under `src/backend`.
- cryptography: Well-audited Python library for X.509 handling and cryptographic primitives.
- PostgreSQL: Relational store for certificate metadata, queues and CRL entries; DB migration files provided.
- Supabase client: Used to interact with Postgres via `supabase` client library.
- Next.js: Frontend application for user interactions and admin UI.
- Docker / docker-compose: Containerization for simplified development and deployment.

Rationale
- `cryptography` provides strong primitives and idiomatic X.509 support. Flask maps well to blueprint-based API structure. PostgreSQL's strong data integrity features make it a good fit for certificate metadata and revocation tracking.

---

## SECURITY ANALYSIS

Threats
- Private key leakage of Root CA: the highest-impact threat.
- Unauthorized signing or revocation operations via compromised admin credentials or API tokens.
- Replay or tampering of stored certificates and CRLs.

Vulnerabilities observed
- Root CA private key is file-backed and unlocked without passphrase by default in code (`password=None`) — if filesystem access is compromised, keys can be misused.
- JWT secret key must be strong; the repository expects `JWT_SECRET_KEY` environment variable, but no built-in rotation mechanism is implemented.

Mitigations
- Store CA private key in a secure HSM or at minimum encrypt key files at rest and use passphrases (the `cryptography` loader supports passphrases but code currently calls `password=None`). If an HSM or KMS is not available, restrict filesystem access, use encrypted volumes, and load keys only into memory when needed.
- Enforce strong `JWT_SECRET_KEY` values and consider short token lifetimes and refresh flows.
- Ensure admin accounts follow MFA and principle of least privilege.

Secure storage
- Recommend using a secrets manager (Vault, AWS KMS, or equivalent) for CA private key.

Cryptographic considerations
- SHA-256 with RSA is used — appropriate for modern compatibility. Consider offering ECDSA (secp256r1/secp384r1) for smaller signatures and performance.

---

## INSTALLATION GUIDE

Prerequisites
- Docker & docker-compose
- Environment variables: `DATABASE_URL`, `KEY_PATH_CA`, `CERT_PATH_CA`, `JWT_SECRET_KEY`, and optional CA configuration envs such as `RSA_KEY_SIZE`.

Quick start (development)

1. Copy environment files and provide values (do not place real private keys in repo):

```bash
cp src/backend/.env.example src/backend/.env
# Edit src/backend/.env to set JWT_SECRET_KEY, DATABASE_URL, KEY_PATH_CA, CERT_PATH_CA, etc.
```

2. Run migrations and start containers using `docker-compose` (development flow uses `db-migrate` first):

```bash
# from repo root
DATABASE_URL='postgresql://user:password@db-host:5432/postgres' docker compose up --build
```

3. Backend will be reachable on port `5000`, frontend on `3000` by default according to `docker-compose.yml`.

Database setup
- The repository contains migration scripts in `db/migrations` and a helper script `scripts/migration.sh` that the `db-migrate` container runs.

Certificate setup
- Place Root CA key and certificate at locations referenced by `KEY_PATH_CA` and `CERT_PATH_CA` (or use the `root_ca` blueprint to create/import Root CA if provided by the UI/API). Example sample files are under `src/backend/secrets` as `.example` files — do not use these in production.

Configuration
- `src/backend/.env.example` documents common environment variables used by the backend.

---

## USER MANUAL

General usage

1. Create an account (frontend UI) and log in.
2. Navigate to Certificate Request → Create CSR: fill subject fields (`CN`, `O`, `C`, etc.), optional SANs, select key algorithm and size, and submit.
3. The system returns a private key PEM (user must store it securely) and a CSR PEM used to request issuing.
4. Admin reviews pending requests (Approval area) and approves issuance; the system signs the CSR and stores the issued certificate in `certificates`.

Admin operations

- Generate or import Root CA: Use the `root_ca` admin endpoint to create a new Root CA or upload existing `ca_key.pem` and `ca_cert.pem` files.
- Approve certificate requests: Use `approve` blueprint in UI or API to sign and publish certificate.
- Revoke certificates: Two flows exist — user can request revocation (creates `revocation_requests`), and admin approves; admin can also perform direct revocation using the admin revoke endpoint.
- Generate CRL: Admin triggers CRL generation; the CRL is signed and stored in `crl` table; it can be downloaded from the CRL endpoint.

Certificate verification

- Use the `certificate_inspector` API to parse a PEM certificate and verify that it is signed by the CA and check its validity and status.

---

## TESTING

Testing strategy
- Unit tests: the repository includes tests under `src/backend/tests` that exercise RSA operations, CSR validation, CRL service, and API-level tests.
- Integration tests: run migrations and exercise API endpoints via test clients or by starting the services.

Example test commands

```bash
# From src/backend
# run Python tests (pytest expected)
pytest -q

# Frontend tests (if present) - use pnpm
cd src/frontend && pnpm install && pnpm test
```

Security testing
- Validate that private keys are never committed to version control.
- Run static code analysis and dependency vulnerability scanning.

---

## LIMITATIONS

- OCSP responder is not implemented — only CRL-based revocation is supported.
- Root CA private key handling expects local file access and is not integrated with HSM/KMS.
- No automatic certificate renewal workflow is provided.

---

## FUTURE IMPROVEMENTS

- Add OCSP responder for real-time revocation status.
- Integrate HSM or KMS for CA private key safeguarding.
- Add certificate auto-rotation and renewal workflows.
- Harden key storage and enable encrypted private key loading with passphrase support.
- Improve role-based access control and admin action logging to an external SIEM.

---

## CONCLUSION

This repository implements a practical, full-stack private CA with certificate issuance, revocation (CRL), and administrative workflows. The system is suitable for lab and internal usage but requires hardening (HSM, encrypted key storage, OCSP) prior to production deployment.

---

## REFERENCES

- cryptography.io — Python cryptography library documentation
- RFC 5280 — Internet X.509 Public Key Infrastructure Certificate and CRL Profile
- OpenSSL documentation (for reference commands and interoperability)

---

## APPENDICES

### A — Important file references

- Backend entry: [src/backend/main.py](src/backend/main.py#L1-L120)
- Certificate signer: [src/backend/core/crypto/cert_signer.py](src/backend/core/crypto/cert_signer.py#L1-L120)
- RSA utilities: [src/backend/core/crypto/RSA.py](src/backend/core/crypto/RSA.py#L1-L140)
- CSR generator: [src/backend/core/services/csr_generator.py](src/backend/core/services/csr_generator.py#L1-L200)
- Revocation service: [src/backend/core/services/revocation_service.py](src/backend/core/services/revocation_service.py#L1-L240)
- CRL service: [src/backend/core/services/crl.py](src/backend/core/services/crl.py#L1-L240)
- DB CRL function: [db/functions/generate_crl.sql](db/functions/generate_crl.sql#L1-L40)
- DB revoke function: [db/functions/revoke_certificate.sql](db/functions/revoke_certificate.sql#L1-L40)

### B — Mermaid: Certificate lifecycle

```mermaid
sequenceDiagram
  participant User
  participant Frontend as FE
  participant Backend as API
  participant DB
  participant CA

  User->>FE: Create CSR (subject, SAN)
  FE->>API: POST /api/cert_request
  API->>DB: Insert certificate_request
  Admin->>FE: Approve request
  FE->>API: POST /api/approve
  API->>CA: Load Root CA key, sign CSR
  CA-->>API: PEM certificate
  API->>DB: Insert certificate row (certificate_pem)
  User->>FE: Download certificate
```

### C — Certificate lifecycle state machine

```mermaid
stateDiagram-v2
  [*] --> Pending: CSR submitted
  Pending --> Approved: Admin approves
  Pending --> Rejected: Admin rejects
  Rejected --> [*]
  Approved --> Active: Certificate issued (valid_from ≤ now)
  Active --> Revoked: Revocation approved
  Active --> Expired: valid_to ≤ now
  Expired --> [*]
  Revoked --> [*]
```

### D — Revocation approval workflow

```mermaid
sequenceDiagram
  participant User
  participant Admin
  participant Backend as API
  participant DB

  User->>API: POST /api/user/revoke/{serial}/request
  API->>DB: Insert revocation_requests (status=pending)
  Admin->>API: GET /api/admin/revoke/list
  API->>DB: Fetch pending revocation_requests
  Admin->>API: POST /api/admin/revoke/{serial}/approve
  API->>DB: Update certificate status=revoked
  API->>DB: Insert into revocations
  API->>DB: Update revocation_requests status=approved
  Note over Admin,DB: Revocation now eligible for CRL generation
```

### E — CRL generation workflow

```mermaid
sequenceDiagram
  participant Admin
  participant Backend as API
  participant RSA
  participant DB

  Admin->>API: GET /api/v1/crl
  API->>DB: Fetch all revocations
  API->>RSA: Load CA key and cert
  RSA-->>API: Key material loaded
  API->>API: Build CRL (issuer, revoked list)
  API->>RSA: Sign CRL with CA private key (SHA256)
  RSA-->>API: Signed CRL PEM
  API->>DB: Insert into crl table
  API->>DB: Move revocations to crl_entries
  API-->>Admin: CRL created, metadata returned
```

### F — System components data flow

```mermaid
graph TB
  subgraph Frontend["Frontend (Next.js)"]
    UI[Web UI / Pages]
  end

  subgraph Backend["Backend (Flask)"]
    Routes["API Routes (v1/)"]
    Services["Core Services<br/>(CSR, Signing, Revocation, CRL)"]
    Crypto["Crypto Layer<br/>(RSA, Signer)"]
    Repo["Repository Layer<br/>(DB Access)"]
  end

  subgraph Storage["Storage"]
    DB[(PostgreSQL Database)]
    FS["File System<br/>(CA Key & Cert)"]
  end

  UI -->|JSON API| Routes
  Routes -->|Route dispatch| Services
  Services --> Crypto
  Services --> Repo
  Crypto -->|Load/sign| FS
  Repo -->|Query/Insert| DB
  UI -->|Health check| Routes
  DB -->|Query results| Repo
```

---

## Additional Resources

- [USER_MANUAL.md](USER_MANUAL.md) — User and admin operational guide
- [DEVELOPER.md](DEVELOPER.md) — Developer guide and code structure
- [API.md](API.md) — Complete API endpoint reference
- [DEPLOY.md](DEPLOY.md) — Deployment instructions
- [MIGRATION.md](MIGRATION.md) — Database setup and migration
- [ENV.md](ENV.md) — Environment variables reference

---

End of technical report.
