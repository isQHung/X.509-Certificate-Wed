from core.database import supabase

class RevocationService:
    
    @staticmethod
    def get_pending_requests() -> list:
        response = supabase.table('certificates') \
            .select('id, serial_number, status') \
            .eq('status', 'active') \
            .execute()
            
        return response.data

    @staticmethod
    def approve_request(serial: str, reason: str = "Admin Approved") -> dict:
        try:
            # BƯỚC 1: Tra cứu UUID của chứng chỉ dựa vào Serial Number
            cert_response = supabase.table('certificates') \
                .select('id, status') \
                .eq('serial_number', serial) \
                .execute()
            
            # Kiểm tra xem chứng chỉ có tồn tại không
            if not cert_response.data:
                raise ValueError(f"Không tìm thấy chứng chỉ với Serial: {serial}")
                
            cert_data = cert_response.data[0]
            cert_uuid = cert_data['id']
            
            # Kiểm tra xem nó đã bị thu hồi trước đó chưa
            if cert_data['status'] == 'revoked':
                raise ValueError(f"Chứng chỉ {serial} đã bị thu hồi từ trước.")

            # BƯỚC 2: Gọi hàm SQL qua Supabase RPC
            # Tham số truyền vào phải KHỚP 100% với tên biến trong hàm SQL
            rpc_params = {
                "cert_uuid": cert_uuid, 
                "reason_text": reason
            }
            
            # Thực thi stored procedure
            supabase.rpc('revoke_certificate', rpc_params).execute()
            
            return {"serial": serial, "status": "revoked"}
            
        except ValueError as ve:
            # Bắn lỗi logic ra cho Router xử lý thành 400 Bad Request
            raise ve
        except Exception as e:
            # Bắn lỗi từ Supabase ra cho Router xử lý thành 500
            raise ValueError(f"Lỗi từ Supabase: {str(e)}")