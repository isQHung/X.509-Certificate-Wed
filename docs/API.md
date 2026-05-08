# API Documentation — X.509 CA Web System

Base path: `/api` (Flask blueprint), versioned endpoints under `/api/v1`.

Authentication: JWT tokens (HS256) via cookie `session_token` or Authorization header. Admin-only routes enforced by middleware.

## Endpoint summary

### CSR and Key Management
- POST `/api/v1/cert_request` — Create a CSR (or submit existing `csr_pem`). Returns CSR PEM, private key PEM (if generated), request id.
- POST `/api/v1/cert_request/<uuid:req_id>/cancel` — Cancel a CSR request.
- GET `/api/v1/cert_request/list` — List CSR requests for authenticated user.
- POST `/api/v1/keys/generate` — Generate a key pair for user (returns private/public PEM and key metadata).

### Certificate operations
- GET `/api/v1/certificates/my` — Get certificates for authenticated user (query `status` optional).
- GET `/api/v1/certificates/all` — Get all certificates (admin use).
- POST `/api/v1/certificates/import` — Import external certificate file (multipart/form-data `certificate`).
- POST `/api/v1/certificate/inspect` — Upload a certificate and inspect fields (multipart form-data `certificate`).

### Approval / Admin
- POST `/api/v1/approve/<uuid:id>/approve` — Approve CSR (admin). Signs CSR and returns serial number.
- POST `/api/v1/approve/<uuid:id>/reject` — Reject CSR (admin).
- GET `/api/v1/approve/list` — List pending CSRs.

### Revocation and CRL
- POST `/api/v1/user/revoke/<serial>/request` — User requests revocation for certificate serial.
- POST `/api/v1/user/revoke/<serial>/cancel` — Cancel a pending revocation request.
- GET `/api/v1/admin/revoke/list` — Admin: list pending revocation requests.
- POST `/api/v1/admin/revoke/<serial>/approve` — Admin: approve revocation request for serial.
- POST `/api/v1/admin/revoke/<serial>/reject` — Admin: reject revocation request.
- POST `/api/v1/admin/revoke/direct/<serial>` — Admin: directly revoke certificate by serial.
- GET `/api/v1/crl` — Generate CRL immediately and return metadata (signed PEM stored in DB).
- GET `/api/v1/crl/latest` — Retrieve the latest CRL.
- GET `/api/v1/crl/revocations` — List recent revocation entries.

### Root CA
- GET `/api/v1/root_ca/certificate` — Get Root CA certificate info (PEM and metadata).
- POST `/api/v1/admin/root/generate` — Generate Root CA from ENV variables and store to configured paths (admin only).
- POST `/api/v1/admin/root/revoke` — Revoke Root CA by deleting files (admin only).

## Errors
- Standard JSON error responses with HTTP status codes. Middleware blocks unauthorized access and returns `401`/`403` where applicable.

## Example: Approve CSR (curl)

```bash
curl -X POST "http://localhost:5000/api/v1/approve/<id>/approve" \
  -H "Cookie: session_token=<JWT>"
```

---

See source files in `src/backend/api/v1/` for precise request/response behavior and validation logic. Each blueprint contains detailed parameter checks and error messages.
