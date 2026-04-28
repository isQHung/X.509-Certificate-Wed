from datetime import datetime, timezone, timedelta
from db.supabase_client import get_supabase_client
from typing import List, Optional
from schema.database_schema import Revocation
from schema.database_schema import Revocation, CRLCreate, CRLEntryCreate
from core.services.audit_event import normalize_user_id
supabase = get_supabase_client()
class RevocationService:
    
    
    @staticmethod
    def get_pending_list() -> List[Revocation]:
        res = (
            supabase.table("revocation_requests")
            .select("id, certificate_id, reason, status, created_at, certificates!inner(serial_number)")
            .eq("status", "pending")
            .execute()
        )

        return [
            Revocation(
                id=item["id"],
                certificate_id=item["certificate_id"],
                serial_number=item["certificates"]["serial_number"],
                reason=item["reason"],
                status=item["status"],
                revoked_at=item["created_at"]
            ) 
            for item in res.data
        ]

    @staticmethod
    def approve_revocation(serial_number: str, actor_id: str = None) -> bool:
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        actor_uuid = normalize_user_id(actor_id)
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
            "approved_by": actor_uuid
        }).eq("id", request_id).execute()

        supabase.table("revocations").insert({
            "certificate_id": cert_id,
            "serial_number": serial_number,
            "reason": actual_reason,
            "revoked_at": now_iso
        }).execute()

        

        return True
    
    @staticmethod
    def reject_revocation(serial_number: str, actor_id: str = None) -> bool:
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        actor_uuid = normalize_user_id(actor_id)


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
            "approved_by": actor_uuid
        }).eq("id", request_id).execute()
            
        return True

    @staticmethod
    def revoke_certificate_by_serial(serial_number: str, reason: str = "Admin Direct Revocation", actor_id: str = None) -> bool:
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        actor_uuid = normalize_user_id(actor_id)

        # 1. Tìm chứng chỉ
        cert_res = supabase.table("certificates") \
            .select("id, status") \
            .eq("serial_number", serial_number) \
            .execute()
        
        if not cert_res.data:
            raise ValueError(f"Không tìm thấy chứng chỉ với Serial: {serial_number}")
            
        cert_id = cert_res.data[0]["id"]
        
        if cert_res.data[0]["status"] == "revoked":
            raise ValueError(f"Chứng chỉ Serial {serial_number} đã bị thu hồi trước đó.")

        # 2. Cập nhật trạng thái chứng chỉ
        supabase.table("certificates").update({
            "status": "revoked"
        }).eq("id", cert_id).execute()

        # 3. Chèn vào bảng revocations (cho CRL)
        supabase.table("revocations").insert({
            "certificate_id": cert_id,
            "serial_number": serial_number,
            "reason": reason,
            "revoked_at": now_iso
        }).execute()

        # 4. Tìm và đóng bất kỳ yêu cầu thu hồi nào đang chờ (nếu có)
        supabase.table("revocation_requests").update({
            "status": "approved",
            "approved_at": now_iso,
            "approved_by": actor_uuid
        }).eq("certificate_id", cert_id).eq("status", "pending").execute()

        return True