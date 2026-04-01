import pytest
from unittest.mock import patch, MagicMock
from core.services.rec_rq_service import RevocationRequestService

# ==========================================
# FIXTURE: Cấu hình Mock Supabase
# ==========================================
@pytest.fixture
def mock_supabase():
    # 2. SỬA DÒNG NÀY: Đường dẫn mock cũng phải đi từ core
    with patch("core.services.rec_rq_service.supabase") as mock:
        yield mock

# ==========================================
# 1. TEST LUỒNG: CREATE REVOCATION REQUEST
# ==========================================

def test_create_request_success(mock_supabase):
    # Setup Data giả
    mock_cert_chain = MagicMock()
    mock_cert_chain.select.return_value.eq.return_value.execute.return_value.data = [{"id": "cert-123", "status": "active"}]
    
    mock_req_chain = MagicMock()
    # Giả lập không có đơn pending nào (data = [])
    mock_req_chain.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
    
    # Hàm side_effect để chia nhánh mock theo tên bảng
    def table_side_effect(table_name):
        if table_name == "certificates": return mock_cert_chain
        if table_name == "revocation_requests": return mock_req_chain

    mock_supabase.table.side_effect = table_side_effect

    # Gọi hàm thực tế
    result = RevocationRequestService.create_revocation_request("TEST-001", "Mất key")
    
    # Assert (Kiểm tra kết quả)
    assert result is True
    # Đảm bảo hàm insert đã được gọi
    mock_req_chain.insert.assert_called_once()


def test_create_request_cert_not_found(mock_supabase):
    mock_cert_chain = MagicMock()
    # Giả lập không tìm thấy chứng chỉ (data = [])
    mock_cert_chain.select.return_value.eq.return_value.execute.return_value.data = []
    mock_supabase.table.return_value = mock_cert_chain

    with pytest.raises(ValueError) as exc:
        RevocationRequestService.create_revocation_request("GHOST-001", "Mất key")
    
    assert "Không tìm thấy chứng chỉ" in str(exc.value)


def test_create_request_cert_not_active(mock_supabase):
    mock_cert_chain = MagicMock()
    # Giả lập chứng chỉ đang bị revoked
    mock_cert_chain.select.return_value.eq.return_value.execute.return_value.data = [{"id": "cert-123", "status": "revoked"}]
    mock_supabase.table.return_value = mock_cert_chain

    with pytest.raises(ValueError) as exc:
        RevocationRequestService.create_revocation_request("TEST-001", "Mất key")
    
    assert "không thể gửi yêu cầu thu hồi" in str(exc.value)


def test_create_request_already_pending(mock_supabase):
    mock_cert_chain = MagicMock()
    mock_cert_chain.select.return_value.eq.return_value.execute.return_value.data = [{"id": "cert-123", "status": "active"}]
    
    mock_req_chain = MagicMock()
    # Giả lập đã CÓ 1 đơn pending (data có giá trị)
    mock_req_chain.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = [{"id": "req-999"}]
    
    def table_side_effect(table_name):
        if table_name == "certificates": return mock_cert_chain
        if table_name == "revocation_requests": return mock_req_chain

    mock_supabase.table.side_effect = table_side_effect

    with pytest.raises(ValueError) as exc:
        RevocationRequestService.create_revocation_request("TEST-001", "Mất key")
    
    assert "đã gửi yêu cầu thu hồi cho chứng chỉ này rồi" in str(exc.value)


# ==========================================
# 2. TEST LUỒNG: CANCEL REVOCATION REQUEST
# ==========================================

def test_cancel_request_success(mock_supabase):
    mock_req_chain = MagicMock()
    # Giả lập tìm thấy 1 đơn pending
    mock_req_chain.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = [{"id": "req-123"}]
    mock_supabase.table.return_value = mock_req_chain

    # Gọi hàm thực tế
    result = RevocationRequestService.cancel_revocation_request("TEST-001")
    
    assert result is True
    # Đảm bảo hàm update đã được gọi với trạng thái 'cancelled'
    mock_req_chain.delete.assert_called_once()


def test_cancel_request_not_found(mock_supabase):
    mock_req_chain = MagicMock()
    # Giả lập KHÔNG tìm thấy đơn pending nào để hủy
    mock_req_chain.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
    mock_supabase.table.return_value = mock_req_chain

    with pytest.raises(ValueError) as exc:
        RevocationRequestService.cancel_revocation_request("TEST-001")
    
    assert "Không tìm thấy yêu cầu thu hồi nào đang chờ duyệt" in str(exc.value)