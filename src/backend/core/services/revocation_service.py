from datetime import datetime, timezone, timedelta
from db.supabase_client import get_supabase_client
from typing import List, Optional
from schema.database_schema import Revocation
from schema.database_schema import Revocation, CRLCreate, CRLEntryCreate
supabase = get_supabase_client()
class RevocationService:
    
    
    @staticmethod
    def get_pending_list() -> List[Revocation]:
        """Lấy danh sách chờ duyệt, trả về List các object Pydantic"""
        response = supabase.table("revocations") \
            .select("id, certificate_id, serial_number, reason, revoked_at, certificates!inner(subject, status, valid_to)") \
            .eq("certificates.status", "active") \
            .execute()
        
        return [Revocation(**item) for item in response.data]

    @staticmethod
    def approve_revocation(serial_number: str) -> dict:
        """Phê duyệt thu hồi và tạo ngay CRL theo yêu cầu của Lead"""
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        next_update = (now + timedelta(days=7)).isoformat()
        now_utc = datetime.now(timezone.utc).isoformat()
        next_update_utc = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat() # CRL có hạn 7 ngày

        cert_res = supabase.table("certificates") \
            .select("id, status") \
            .eq("serial_number", serial_number) \
            .execute()
        
        if not cert_res.data:
            raise ValueError(f"Không tìm thấy chứng chỉ với Serial: {serial_number}")
            
        if cert_res.data[0]["status"] == "revoked":
            raise ValueError(f"Chứng chỉ {serial_number} đã bị thu hồi từ trước.")

        revo_res = supabase.table("revocations") \
            .select("reason") \
            .eq("serial_number", serial_number) \
            .execute()
        actual_reason = revo_res.data[0]["reason"] if revo_res.data else "Admin Approved"

        supabase.table("certificates").update({
            "status": "revoked"
        }).eq("serial_number", serial_number).execute()

        crl_payload = CRLCreate(
            version=2,
            generated_at=now,
            next_update=now + timedelta(days=7),
            crl_pem="-----BEGIN X509 CRL-----\nMIIB...SIGNED_CONTENT...-----END X509 CRL-----" 
        )
        
        crl_res = supabase.table("crl").insert(crl_payload.model_dump(exclude_none=True)).execute()
        new_crl_id = crl_res.data[0]["id"]
        crl_entry_data = {
            "crl_id": new_crl_id,
            "serial_number": serial_number,
            "revoked_at": now_utc,
            "reason": actual_reason
        }
        supabase.table("crl_entries").insert(crl_entry_data).execute()

        

        return {
            "success": True,
            "serial_number": serial_number,
            "status": "revoked",
            "revoked_at": now_iso,
            "message": "Certificate has been successfully revoked and added to CRL."
        }
    
    @staticmethod
    def reject_revocation(serial_number: str) -> dict:
        """Từ chối thu hồi: Xóa đơn xin thu hồi khỏi bảng revocations"""
        
        cert_res = supabase.table("certificates") \
            .select("id, status") \
            .eq("serial_number", serial_number) \
            .execute()
        
        if not cert_res.data:
            raise ValueError(f"Không tìm thấy chứng chỉ với Serial: {serial_number}")
            
        if cert_res.data[0]["status"] == "revoked":
            raise ValueError(f"Chứng chỉ {serial_number} đã bị thu hồi, không thể từ chối thao tác này nữa.")

        delete_res = supabase.table("revocations") \
            .delete() \
            .eq("serial_number", serial_number) \
            .execute()
            
        if not delete_res.data:
             raise ValueError(f"Không có yêu cầu thu hồi nào đang chờ duyệt cho Serial: {serial_number}")

        return {
            "success": True,
            "serial_number": serial_number,
            "status": "rejected",
            "message": "Revocation request has been rejected and removed from the queue.",
            "processed_at": datetime.now(timezone.utc).isoformat()
        }