# 1. Bảng lưu trạng thái toàn bộ Chứng chỉ
certificates_db = {
    "001": {"serial": "001", "status": "ACTIVE", "owner": "test.yas.com"},
    "002": {"serial": "002", "status": "ACTIVE", "owner": "user.domain.com"},
}

# 2. Bảng chứa các YÊU CẦU ĐANG CHỜ DUYỆT (Pending Requests)
pending_revocation_requests = {
    "001": {"serial": "001", "reason": "Lộ Private Key", "requested_by": "user1"},
}

# 3. Bảng CRL (Sổ đen chứa các chứng chỉ đã chính thức bị thu hồi)
crl_table = []