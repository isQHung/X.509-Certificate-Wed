from datetime import datetime, timezone, timedelta
from db.supabase_client import get_supabase_client
from typing import List, Optional
from schema.database_schema import Revocation
from schema.database_schema import Revocation, CRLCreate, CRLEntryCreate
supabase = get_supabase_client()
class RevocationService:
    
    
    @staticmethod
    def get_pending_list() -> List[Revocation]:
        response = supabase.table("revocation_requests") \
            .select("id, certificate_id, reason, status, created_at, certificates!inner(serial_number, subject, status, valid_to)") \
            .eq("status", "pending") \
            .execute()
        
        return [Revocation(**item) for item in response.data]

    @staticmethod
    def approve_revocation(serial_number: str) -> bool:
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        req_res = supabase.table("revocation_requests") \
            .select("id, certificate_id, reason, status, certificates!inner(serial_number)") \
            .eq("certificates.serial_number", serial_number) \
            .eq("status", "pending") \
            .execute()
        
        if not req_res.data:
            raise ValueError(f"Không có yêu cầu thu hồi nào đang chờ duyệt cho Serial: {serial_number}")
            
        request_id = req_res.data[0]["id"]
        cert_id = req_res.data[0]["certificate_id"]
        actual_reason = req_res.data[0]["reason"]

        supabase.table("certificates").update({
            "status": "revoked"
        }).eq("id", cert_id).execute()

        supabase.table("revocation_requests").update({
            "status": "approved",
            "approved_at": now.isoformat(),
            "approved_by": None
        }).eq("id", request_id).execute()

        supabase.table("revocations").insert({
            "certificate_id": cert_id,
            "serial_number": serial_number,
            "reason": actual_reason,
            "revoked_at": now_iso
        }).execute()

        crl_latest = supabase.table("crl") \
            .select("id") \
            .order("generated_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not crl_latest.data:
            raise ValueError("Không tìm thấy bản ghi CRL nào trong hệ thống để gán entry.")
        target_crl_id = crl_latest.data[0]["id"]
        entry_payload = CRLEntryCreate(
            crl_id=target_crl_id,
            serial_number=serial_number,
            revoked_at=now,
            reason=actual_reason
        )
        supabase.table("crl_entries").insert(entry_payload.model_dump()).execute()

        return True
    
    @staticmethod
    def reject_revocation(serial_number: str) -> bool:
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()


        req_res = supabase.table("revocation_requests") \
            .select("id, status, certificates!inner(serial_number)") \
            .eq("certificates.serial_number", serial_number) \
            .eq("status", "pending") \
            .execute()
        
        if not req_res.data:
            raise ValueError(f"Không tìm thấy yêu cầu thu hồi (pending) nào cho Serial: {serial_number}")


        request_id = req_res.data[0]["id"]


        supabase.table("revocation_requests").update({
            "status": "rejected",
            "approved_at": now_iso, 
            "approved_by": None
        }).eq("id", request_id).execute()
            
        return True