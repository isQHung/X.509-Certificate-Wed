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