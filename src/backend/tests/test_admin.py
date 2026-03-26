import pytest
from flask import Flask
from unittest.mock import patch, MagicMock
import uuid
from datetime import datetime, timezone
from router.admin import admin_bp 

# --- CẤU HÌNH FIXTURE CHO FLASK ---
@pytest.fixture
def app():
    """Tạo app Flask ảo để test API"""
    app = Flask(__name__)
    app.register_blueprint(admin_bp)
    return app

@pytest.fixture
def client(app):
    """Tạo test client để gọi API"""
    return app.test_client()


# 1. Test API: Lấy danh sách PENDING
@patch("service.csr_service.get_csr")
def test_list_pending_csr(mock_get_csr, client):
    # Giả lập Supabase trả về 2 bản ghi
    mock_get_csr.return_value = [
        {"id": "uuid-1", "status": "pending"},
        {"id": "uuid-2", "status": "pending"}
    ]
    
    response = client.get("/api/v1/admin/approve/list")
    
    assert response.status_code == 200
    assert len(response.json) == 2
    assert response.json[0]["status"] == "pending"
    mock_get_csr.assert_called_once_with(status="pending")


# 2. Test API: Từ chối CSR (Thành công)
@patch("service.csr_service.update_csr_status")
@patch("service.csr_service.get_csr_by_id")
def test_reject_csr_success(mock_get_csr_by_id, mock_update_csr_status, client):
    test_id = uuid.uuid4()
    
    # Giả lập tìm thấy CSR đang chờ
    mock_get_csr_by_id.return_value = {"id": str(test_id), "status": "pending"}
    
    response = client.post(f"/api/v1/admin/reject/{test_id}")
    
    assert response.status_code == 200
    assert response.json == {"message": "Rejected"}
    mock_update_csr_status.assert_called_once() # Đảm bảo đã gọi hàm lưu DB


# 3. Test API: Từ chối CSR (Thất bại do không tìm thấy / Đã xử lý)
@patch("service.csr_service.get_csr_by_id")
def test_reject_csr_fail_already_processed(mock_get_csr_by_id, client):
    test_id = uuid.uuid4()
    
    # Giả lập CSR đã được xử lý từ trước
    mock_get_csr_by_id.return_value = {"id": str(test_id), "status": "issued"}
    
    response = client.post(f"/api/v1/admin/reject/{test_id}")
    
    assert response.status_code == 400
    assert "Already processed" in response.json["error"]


# 4. Test API: Phê duyệt CSR (Thành công - Test luồng phức tạp nhất)
@patch("service.csr_service.update_csr_time")
@patch("service.csr_service.update_csr_status")
@patch("service.csr_service.save_certificate")
@patch("service.csr_service.rsa_service") # Mock cái rsa_service ở đầu file csr_service.py
@patch("service.csr_service.get_csr_by_id")
def test_approve_csr_success(mock_get_csr_by_id, mock_rsa_service, mock_save_cert, mock_update_status, mock_update_time, client):
    test_id = uuid.uuid4()
    
    # 4.1. Giả lập Database trả về 1 CSR hợp lệ
    mock_get_csr_by_id.return_value = {
        "id": str(test_id),
        "status": "pending",
        "csr_pem": "fake_csr_data_here",
        "subject": {"CN": "example.com"},
        "san": ["example.com", "www.example.com"]
    }
    
    # 4.2. Giả lập Chứng chỉ (Certificate Object) mà hàm sign_csr trả về
    mock_cert = MagicMock()
    mock_cert.serial_number = 999888777
    mock_cert.not_valid_before = datetime.now(timezone.utc)
    mock_cert.not_valid_after = datetime.now(timezone.utc)
    # Giả lập chain gọi hàm public_key().public_bytes()
    mock_cert.public_key.return_value.public_bytes.return_value = b"fake_public_key_pem"
    
    # 4.3. Giả lập các hàm của RSACAService
    mock_rsa_service.load_root_ca_credentials.return_value = ("fake_priv_key", "fake_ca_cert")
    mock_rsa_service.sign_csr.return_value = mock_cert
    mock_rsa_service.serialize_cert.return_value = b"fake_certificate_pem"
    
    # 4.4. Thực thi API
    response = client.post(f"/api/v1/admin/approve/{test_id}")
    
    # 4.5. Kiểm tra kết quả trả về
    assert response.status_code == 200
    assert response.json["message"] == "Approved"
    assert response.json["serial"] == "999888777"
    
    # 4.6. Đảm bảo các hàm lưu DB được gọi với dữ liệu chính xác
    mock_save_cert.assert_called_once()
    saved_cert_data = mock_save_cert.call_args[0][0] # Lấy dữ liệu truyền vào hàm save_certificate
    assert saved_cert_data["status"] == "active"
    assert saved_cert_data["subject"] == {"CN": "example.com"}
    
    mock_update_status.assert_called_once()
    mock_update_time.assert_called_once()