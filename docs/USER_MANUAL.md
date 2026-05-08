# User Manual — X.509 Certificate Authority Web System

This manual covers common user tasks: requesting certificates, downloading issued certificates, requesting revocation, and basic admin operations.

## Accessing the system
- Web UI: default at `http://localhost:3000`
- Backend API: default at `http://localhost:5000/api`

## Requesting a Certificate (CSR)
1. Open the UI and navigate to **Certificates → Request Certificate**.
2. Fill in subject fields (Common Name `CN` is required). Optionally add SANs (comma-separated DNS names).
3. Choose key algorithm (`RSA` or `EC`) and size (RSA: 2048/3072/4096; EC: 256/384).
4. Submit the form. The system returns a CSR PEM and the generated private key PEM — store the private key securely.

API example (create CSR):

POST /api/v1/cert_request

Body JSON (example):

```json
{
  "alias": "my-key-1",
  "subject": {"CN":"example.com","O":"Example Inc","C":"US"},
  "san": ["example.com","www.example.com"],
  "key_algorithm": "RSA",
  "key_size": 2048,
  "validity_days": 365
}
```

## Viewing and Downloading Issued Certificates
- In the UI, go to **My Certificates**. Click an entry to view PEM or download the certificate file.

## Revocation Requests (User)
1. Go to **Certificates → Request Revocation**.
2. Provide the certificate serial number and reason (e.g., "Lost private key").
3. Submit — the request will be marked pending and requires admin approval.

API example (request revocation):

POST /api/v1/user/revoke/{serial}/request

Body JSON:

```json
{ "reason": "Lost private key" }
```

## Admin Operations (Admin role required)
- Approve CSR requests (sign and issue certificate): POST `/api/v1/approve/{id}/approve`.
- Directly revoke certificate: POST `/api/v1/admin/revoke/direct/{serial}`.
- Generate CRL: GET `/api/v1/crl`.
- Create Root CA from ENV: POST `/api/v1/admin/root/generate`.

## Best practices for users
- Store private keys in a secure keystore. Do not upload or commit private keys.
- Verify certificate fingerprints after issuance.

---

End of user manual.
