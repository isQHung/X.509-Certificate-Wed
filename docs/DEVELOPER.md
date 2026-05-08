# Developer Documentation — X.509 CA Web System

This developer guide explains the code organization, how to run tests, and how to modify core services.

## Code layout
- `src/backend` — Flask application and core services
  - `core/crypto` — cryptographic primitives and signer (`RSA.py`, `cert_signer.py`)
  - `core/services` — business logic for CSR generation, approvals, revocation, CRL
  - `core/repository` — database access wrappers
  - `api/v1` — API blueprints for endpoints
  - `tests` — unit and integration tests
- `src/frontend` — Next.js frontend application
- `db` — SQL migrations, schema, functions

## Key modules
- `src/backend/core/crypto/cert_signer.py` — builds and signs X.509 certificates using `cryptography.x509`.
- `src/backend/core/services/csr_generator.py` — produces CSRs and inserts certificate_request records.
- `src/backend/core/services/crl.py` — builds CRLs from revocations and signs with CA private key.

## Running tests
From repository root:

```bash
cd src/backend
pytest -q
```

## Adding a feature or fixing a bug
1. Create a branch named `docs/update-feature`.
2. Add unit tests under `src/backend/tests` covering new behavior.
3. Update core service and repository code, run tests.
4. Run migration scripts if DB schema changes are required.

## Extending crypto
- Use `core.crypto.RSA.RSACAService` as the canonical helper for RSA operations. To add EC-specific signing, consider adding a new class or extend RSACAService methods.

## Notes
- CA credentials are file-backed; to integrate KMS/HSM, replace `RSACAService.load_root_ca_credentials` and `RSACAService` signing calls with appropriate client calls.
