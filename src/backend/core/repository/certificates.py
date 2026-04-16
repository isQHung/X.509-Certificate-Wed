from schema.database_schema import Certificate, CertificateWithDetails, Revocation
from typing import List, Optional
from uuid import UUID


class CertificateListRepository:
    def __init__(self, supabase_client):
        self.db = supabase_client
        self.cert_table = "certificates"
        self.revocation_table = "revocations"

    def list_by_user(self, user_id: UUID, status: Optional[str] = None) -> List[dict]:
        """Fetch certificates by user from database, with optional status filter"""
        query = (
            self.db.table(self.cert_table)
            .select("*, certificate_requests!inner(user_id)")
            .eq("certificate_requests.user_id", str(user_id))
            .order("created_at", desc=True)
        )

        if status:
            query = query.eq("status", status)

        res = query.execute()
        return res.data or []

    def list_all(self, status: Optional[str] = None) -> List[dict]:
        """Fetch all certificates from database, with optional status filter"""
        query = self.db.table(self.cert_table).select("*").order("created_at", desc=True)

        if status:
            query = query.eq("status", status)

        res = query.execute()
        return res.data or []

    def get_revocations_for_certificate(self, cert_id: UUID) -> List[dict]:
        """Fetch revocations for a specific certificate"""
        query = (
            self.db.table(self.revocation_table)
            .select("*")
            .eq("certificate_id", str(cert_id))
        )
        res = query.execute()
        return res.data or []

    def import_external_certificate(self, user_id: UUID, cert_data: dict, pem_content: str) -> dict:
        """Insert a dummy certificate request and then insert the imported certificate"""
        # 1. Create a dummy certificate request
        key_alg_raw = cert_data.get("public_key_type", "RSA")
        key_alg = "RSA"
        if "RSA" in key_alg_raw:
            key_alg = "RSA"
        elif "EC" in key_alg_raw.upper() or "ELLIPTIC" in key_alg_raw.upper():
            key_alg = "ECDSA"
        elif "ED" in key_alg_raw.upper():
            key_alg = "Ed25519"

        req_data = {
            "user_id": str(user_id),
            "csr_pem": "IMPORTED_EXTERNAL_CERTIFICATE",
            "subject": cert_data.get("subject", {}),
            "san": cert_data.get("extensions", []),
            "key_algorithm": key_alg,
            "key_size": 2048,
            "validity_days": 365,
            "status": "issued"
        }
        res_req = self.db.table("certificate_requests").insert(req_data).execute()
        if not res_req.data:
            raise Exception("Failed to create dummy certificate_request")
        
        req_record = res_req.data[0]
        csr_id = req_record["id"]

        # 2. Extract validity info safely
        validity = cert_data.get("validity", {})
        
        # 3. Create certificate record
        cert_record = {
            "serial_number": str(cert_data.get("serial", "UNKNOWN")),
            "subject": cert_data.get("subject", {}),
            "san": cert_data.get("extensions", []),
            "public_key": "IMPORTED_PUBLIC_KEY", 
            "valid_from": validity.get("not_before"),
            "valid_to": validity.get("not_after"),
            "status": "active",
            "certificate_pem": pem_content,
            "csr_id": csr_id
        }
        res_cert = self.db.table(self.cert_table).insert(cert_record).execute()
        return res_cert.data[0] if res_cert.data else {}