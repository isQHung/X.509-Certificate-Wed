import os
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

os.environ["SUPABASE_URL"] = "http://tao-la-dummy-url-cho-test.com"
os.environ["SUPABASE_KEY"] = "tao_la_dummy_key_cho_test_12345"
os.environ["SUPABASE_ANON_KEY"] = "tao_la_dummy_key_cho_test_12345"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "tao_la_dummy_key_cho_test_12345"
os.environ["SUPABASE_SERVICE_KEY"] = "tao_la_dummy_key_cho_test_12345"

from core.services.revocation_service import RevocationService

@pytest.fixture
def mock_supabase():
    """Fixture để giả lập (mock) Supabase Client, không cho nó gọi DB thật"""
    with patch("core.services.revocation_service.supabase") as mock_db:
        yield mock_db

class TestRevocationService:

    def test_approve_revocation_success(self, mock_supabase):
        """Test luồng duyệt đơn thành công"""
        serial_number = "A1B2C3D4"

        dummy_req_id = "00000000-0000-0000-0000-000000000001"
        dummy_cert_id = "00000000-0000-0000-0000-000000000002"
        dummy_crl_id = "00000000-0000-0000-0000-000000000003"

        mock_req_execute = MagicMock()
        mock_req_execute.data = [{
            "id": dummy_req_id,
            "certificate_id": dummy_cert_id,
            "reason": "Key Compromise"
        }]

        mock_crl_execute = MagicMock()
        mock_crl_execute.data = [{"id": dummy_crl_id}]

        mock_table_requests = MagicMock()
        mock_table_crl = MagicMock()
        mock_table_revocations = MagicMock()
        mock_table_crl_entries = MagicMock()
        mock_table_certificates = MagicMock()

        mock_table_requests.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_req_execute
        mock_table_crl.select.return_value.order.return_value.limit.return_value.execute.return_value = mock_crl_execute

        def mock_table_side_effect(table_name):
            if table_name == "revocation_requests": return mock_table_requests
            if table_name == "crl": return mock_table_crl
            if table_name == "revocations": return mock_table_revocations
            if table_name == "crl_entries": return mock_table_crl_entries
            if table_name == "certificates": return mock_table_certificates
            return MagicMock()

        mock_supabase.table.side_effect = mock_table_side_effect

        result = RevocationService.approve_revocation(serial_number)

        assert result is True
        
        assert mock_table_revocations.insert.called, "Chưa insert vào bảng revocations"
        assert mock_table_crl_entries.insert.called, "Chưa insert vào bảng crl_entries"
        assert mock_table_certificates.update.called, "Chưa update trạng thái certificates"
        assert mock_table_requests.update.called, "Chưa update trạng thái revocation_requests"

    def test_approve_revocation_not_found(self, mock_supabase):
        """Test luồng lỗi: Không tìm thấy đơn xin thu hồi"""
        serial_number = "INVALID_SERIAL"
        
        mock_empty_execute = MagicMock()
        mock_empty_execute.data = []
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_empty_execute

        with pytest.raises(ValueError) as exc_info:
            RevocationService.approve_revocation(serial_number)
            
        assert "Không có yêu cầu thu hồi nào đang chờ duyệt" in str(exc_info.value)

    def test_reject_revocation_success(self, mock_supabase):
        """Test luồng từ chối đơn thành công"""
        serial_number = "A1B2C3D4"
        
        mock_req_execute = MagicMock()
        mock_req_execute.data = [{"id": "req-123"}]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = mock_req_execute

        result = RevocationService.reject_revocation(serial_number)

        assert result is True
        assert mock_supabase.table().update.called