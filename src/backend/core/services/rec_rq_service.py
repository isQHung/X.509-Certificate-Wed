from db.supabase_client import get_supabase_client

supabase = get_supabase_client()

class RevocationRequestService:
    
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
    @staticmethod
    def cancel_revocation_request(serial_number: str, requested_by: str = None) -> bool:
        """
        Khách hàng chủ động hủy yêu cầu thu hồi chứng chỉ khi đơn vẫn đang chờ duyệt (pending).
        """
        # 1. Tìm đơn yêu cầu thu hồi ĐANG CHỜ DUYỆT (pending) của Serial Number này
        req_res = supabase.table("revocation_requests") \
            .select("id, status, certificates!inner(serial_number)") \
            .eq("certificates.serial_number", serial_number) \
            .eq("status", "pending") \
            .execute()
        
        if not req_res.data:
            raise ValueError(f"Không tìm thấy yêu cầu thu hồi nào đang chờ duyệt cho Serial: {serial_number}")
            
        request_id = req_res.data[0]["id"]

        # 2. Cập nhật trạng thái đơn thành 'cancelled' (đã hủy bởi user)
        # Lưu ý: DB của m phải cho phép status 'cancelled' trong bảng revocation_requests.
        # Nếu thiết kế của m là xóa hẳn dòng đó đi thì dùng: supabase.table("revocation_requests").delete().eq("id", request_id).execute()
        # supabase.table("revocation_requests").update({
        #     "status": "cancelled"
        # }).eq("id", request_id).execute()
        supabase.table("revocation_requests").delete().eq("id", request_id).execute()
        return True