from db.supabase_client import get_supabase_client

supabase = get_supabase_client()

class CreateRevocationRequestService:
    
    @staticmethod
    def create_revocation_request(serial_number: str, reason: str, requested_by: str = None) -> bool:
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
            "requested_by": None
        }
        
        supabase.table("revocation_requests").insert(payload).execute()
        
        return True