import os
from datetime import datetime, timezone
from database.supabase import supabase

# TỚ GIẢ ĐỊNH TÊN CLASS, CẬU MỞ FILE database_schema.py RA ĐỂ ĐỔI LẠI CHO ĐÚNG NHÉ!
from schema.database_schema import CertificateCreateSchema 

# CẬU TỰ TÌM HÀM KÝ VÀ HÀM VALIDATE CÓ SẴN CỦA DỰ ÁN ĐỂ IMPORT VÀO ĐÂY
# from core.crypto.xxx import hàm_ký_chứng_chỉ_có_sẵn
# from core.validator.xxx import hàm_validate_csr_có_sẵn

# --- CÁC HÀM TƯƠNG TÁC DATABASE ---
def _get_csr(req_id: str):
    res = supabase.table("certificate_requests").select("*").eq("id", req_id).execute()
    return res.data[0] if res.data else None

def _update_csr_status(req_id: str, status: str):
    now = datetime.now(timezone.utc).isoformat()
    update_data = {"status": status, "updated_at": now}
    
    if status == "issued":
        update_data["approved_at"] = now
        
    supabase.table("certificate_requests").update(update_data).eq("id", req_id).execute()

# --- LOGIC NGHIỆP VỤ ---
def approve_csr(req_id: str):
    csr_req = _get_csr(req_id)
    if not csr_req:
        raise ValueError("CSR không tồn tại")
    
    if csr_req.get("status") != "pending":
        raise ValueError(f"CSR này đã được xử lý (trạng thái: {csr_req.get('status')})")

    # 1. Ký chứng chỉ (Dùng hàm ĐÃ CÓ của dự án, KHÔNG dùng RSACAService tự viết nữa)
    # cert = hàm_ký_chứng_chỉ_có_sẵn(csr_req["csr_pem"])
    
    # 2. Chuẩn bị dữ liệu lưu DB (Dùng Schema để validate như sếp yêu cầu)
    # Đoạn này cậu map dữ liệu từ cái cert vừa ký ra.
    cert_data = {
        "serial_number": "fake-serial", # Thay bằng serial thật từ cert
        "issuer_id": os.getenv("ISSUER_CA"),
        "subject": csr_req.get("subject"),
        "status": "active",
        "csr_id": req_id
    }
    
    # Đẩy qua Schema để validate dữ liệu trước khi insert
    validated_data = CertificateCreateSchema(**cert_data).model_dump() 
    
    # 3. Lưu chứng chỉ mới
    supabase.table("certificates").insert(validated_data).execute()
    
    # 4. Cập nhật trạng thái CSR
    _update_csr_status(req_id, "issued")
    
    return {"message": "Duyệt CSR thành công", "req_id": req_id}

def reject_csr(req_id: str):
    csr_req = _get_csr(req_id)
    if not csr_req:
        raise ValueError("CSR không tồn tại")
        
    if csr_req.get("status") != "pending":
        raise ValueError("Chỉ có thể từ chối CSR đang chờ duyệt")

    _update_csr_status(req_id, "rejected")
    return {"message": "Đã từ chối CSR"}

def list_pending_csr():
    res = supabase.table("certificate_requests").select("*").eq("status", "pending").execute()
    return res.data or []