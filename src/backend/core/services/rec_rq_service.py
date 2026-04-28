from db.supabase_client import get_supabase_client
from core.services.audit_event import normalize_user_id, record_audit_event

supabase = get_supabase_client()

class RevocationRequestService:
    
    @staticmethod
    def create_revocation_request(serial_number: str, reason: str, requested_by: str = None) -> bool:
        actor_id = normalize_user_id(requested_by)
        cert_res = supabase.table("certificates") \
            .select("id, status") \
            .eq("serial_number", serial_number) \
            .execute()
        
        if not cert_res.data:
            raise ValueError(f"Không tìm thấy chứng chỉ với Serial Number: {serial_number}")
            
        cert = cert_res.data[0]
        
        if cert["status"] != "active":
            raise ValueError(f"Chứng chỉ này hiện đang '{cert['status']}', không thể gửi yêu cầu thu hồi.")

        existing_req = supabase.table("revocation_requests") \
            .select("id") \
            .eq("certificate_id", cert["id"]) \
            .eq("status", "pending") \
            .execute()
            
        if existing_req.data:
            raise ValueError("Bạn đã gửi yêu cầu thu hồi cho chứng chỉ này rồi. Vui lòng chờ Admin duyệt.")

        payload = {
            "certificate_id": cert["id"],
            "reason": reason,
            "status": "pending",
            "requested_by": actor_id
        }
        
        supabase.table("revocation_requests").insert(payload).execute()

        record_audit_event(
            "REVOCATION_REQUEST_CREATED",
            requested_by,
            target_type="revocation_request",
            target_id=str(cert["id"]),
            metadata={
                "serial_number": serial_number,
                "certificate_id": str(cert["id"]),
                "reason": reason,
                "status": "pending",
            },
        )
        
        return True
    @staticmethod
    def cancel_revocation_request(serial_number: str, requested_by: str = None) -> bool:
        """
        Khách hàng chủ động hủy yêu cầu thu hồi chứng chỉ khi đơn vẫn đang chờ duyệt (pending).
        """
        actor_id = normalize_user_id(requested_by)
        # 1. Tìm đơn yêu cầu thu hồi ĐANG CHỜ DUYỆT (pending) của Serial Number này
        req_res = supabase.table("revocation_requests") \
            .select("id, status, certificates!inner(serial_number)") \
            .eq("certificates.serial_number", serial_number) \
            .eq("status", "pending") \
            .execute()
        
        if not req_res.data:
            raise ValueError(f"Không tìm thấy yêu cầu thu hồi nào đang chờ duyệt cho Serial: {serial_number}")
            
        request_id = req_res.data[0]["id"]


        supabase.table("revocation_requests").delete().eq("id", request_id).execute()

        record_audit_event(
            "REVOCATION_REQUEST_CANCELED",
            requested_by,
            target_type="revocation_request",
            target_id=str(request_id),
            metadata={
                "serial_number": serial_number,
                "status": "deleted",
            },
        )
        return True