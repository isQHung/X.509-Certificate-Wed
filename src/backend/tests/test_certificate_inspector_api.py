"""
Unit tests for Certificate Inspector API endpoints
Tests the Flask API endpoints for certificate inspection functionality
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from flask import Flask
from werkzeug.datastructures import FileStorage
from io import BytesIO

from api.v1.certificate_inspector import certificate_bp, allowed_file, inspect_certificate
from schema.response import CertificateInspectResponse


class TestAllowedFile:
    """Test file extension validation"""

    def test_allowed_extensions(self):
        """Test allowed file extensions"""
        assert allowed_file("cert.crt") == True
        assert allowed_file("cert.pem") == True
        assert allowed_file("cert.cer") == True
        assert allowed_file("cert.der") == True

    def test_disallowed_extensions(self):
        """Test disallowed file extensions"""
        assert allowed_file("cert.txt") == False
        assert allowed_file("cert.exe") == False
        assert allowed_file("cert") == False
        assert allowed_file("") == False

    def test_case_insensitive(self):
        """Test case insensitive extension checking"""
        assert allowed_file("cert.CRT") == True
        assert allowed_file("cert.PEM") == True
        assert allowed_file("cert.CER") == True
        assert allowed_file("cert.DER") == True


class TestInspectCertificate:
    """Test certificate inspection API endpoint"""

    @pytest.fixture
    def app(self):
        """Create Flask test app"""
        app = Flask(__name__)
        app.register_blueprint(certificate_bp)
        app.config['TESTING'] = True
        return app

    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()

    @pytest.fixture
    def valid_cert_data(self):
        """Valid certificate data for testing"""
        # This is a minimal valid certificate in DER format for testing
        # In real tests, you'd use a proper test certificate
        return b"-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\n-----END CERTIFICATE-----"

    @pytest.fixture
    def mock_cert_info(self):
        """Mock certificate inspection result"""
        return {
            "serial": "1234567890abcdef",
            "subject": {"CN": "test.example.com", "O": "Test Org"},
            "issuer": {"CN": "Test CA", "O": "Test Org"},
            "validity": {
                "not_before": "2023-01-01T00:00:00Z",
                "not_after": "2024-01-01T00:00:00Z",
                "is_valid": True
            },
            "extensions": [
                {"name": "subjectAltName", "critical": False, "value": "DNS:test.example.com"},
                {"name": "keyUsage", "critical": True, "value": "digitalSignature,keyEncipherment"}
            ],
            "public_key_type": "RSA"
        }

    def test_missing_file_field(self, client):
        """Test request without certificate file field"""
        response = client.post('/v1/certificate/inspect')
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data
        assert "No certificate file provided" in data["error"]

    def test_empty_filename(self, client):
        """Test request with empty filename"""
        data = {'certificate': (BytesIO(b''), '')}
        response = client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data
        assert "No file selected" in data["error"]

    def test_invalid_file_extension(self, client):
        """Test request with invalid file extension"""
        data = {'certificate': (BytesIO(b'test content'), 'test.txt')}
        response = client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')
        assert response.status_code == 400
        data = response.get_json()
        assert "Invalid file type" in data["error"]
        assert "Accepted types:" in data["error"]

    def test_file_too_large(self, client):
        """Test request with file exceeding size limit"""
        large_content = b'x' * (1024 * 1024 + 1)  # 1MB + 1 byte
        data = {'certificate': (BytesIO(large_content), 'test.crt')}
        response = client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data
        assert "File size exceeds maximum allowed" in data["error"]

    @patch('api.v1.certificate_inspector.CertificateInspector')
    def test_successful_inspection(self, mock_inspector_class, client, valid_cert_data, mock_cert_info):
        """Test successful certificate inspection"""
        # Mock the CertificateInspector
        mock_inspector = Mock()
        mock_inspector.inspect.return_value = mock_cert_info
        mock_inspector_class.return_value = mock_inspector

        data = {'certificate': (BytesIO(valid_cert_data), 'test.crt')}
        response = client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')

        assert response.status_code == 200
        data = response.get_json()

        # Verify the response structure
        assert "serial" in data
        assert "subject" in data
        assert "issuer" in data
        assert "validity" in data
        assert "extensions" in data
        assert "public_key_type" in data

        # Verify CertificateInspector was called correctly
        mock_inspector_class.assert_called_once_with(valid_cert_data)
        mock_inspector.inspect.assert_called_once()

    @patch('api.v1.certificate_inspector.CertificateInspector')
    def test_certificate_inspector_value_error(self, mock_inspector_class, client, valid_cert_data):
        """Test handling of ValueError from CertificateInspector"""
        # Mock CertificateInspector to raise ValueError
        mock_inspector = Mock()
        mock_inspector.inspect.side_effect = ValueError("Invalid certificate format")
        mock_inspector_class.return_value = mock_inspector

        data = {'certificate': (BytesIO(valid_cert_data), 'test.crt')}
        response = client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')

        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data
        assert "Invalid certificate format" in data["error"]

    @patch('api.v1.certificate_inspector.CertificateInspector')
    def test_certificate_inspector_generic_error(self, mock_inspector_class, client, valid_cert_data):
        """Test handling of generic exceptions from CertificateInspector"""
        # Mock CertificateInspector to raise generic exception
        mock_inspector = Mock()
        mock_inspector.inspect.side_effect = Exception("Unexpected error")
        mock_inspector_class.return_value = mock_inspector

        data = {'certificate': (BytesIO(valid_cert_data), 'test.crt')}
        response = client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')

        assert response.status_code == 500
        data = response.get_json()
        assert "error" in data
        assert "Failed to process certificate" in data["error"]
        assert "Unexpected error" in data["error"]

    @patch('api.v1.certificate_inspector.CertificateInspector')
    def test_response_validation_error(self, mock_inspector_class, client, valid_cert_data):
        """Test handling of invalid response structure from CertificateInspector"""
        # Mock CertificateInspector to return invalid data
        mock_inspector = Mock()
        mock_inspector.inspect.return_value = {"invalid": "data"}
        mock_inspector_class.return_value = mock_inspector

        data = {'certificate': (BytesIO(valid_cert_data), 'test.crt')}
        response = client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')

        # Should return 400 due to Pydantic validation error (ValidationError is subclass of ValueError)
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data

    def test_valid_file_sizes(self, client):
        """Test various valid file sizes"""
        # Test with small file
        small_content = b'x' * 100
        data = {'certificate': (BytesIO(small_content), 'test.crt')}
        response = client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')
        # Should not fail due to size (other validations may fail, but not size)
        assert response.status_code != 400 or "File size exceeds" not in response.get_data(as_text=True)

        # Test with maximum allowed size
        max_content = b'x' * (1024 * 1024)  # Exactly 1MB
        data = {'certificate': (BytesIO(max_content), 'test.crt')}
        response = client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')
        assert response.status_code != 400 or "File size exceeds" not in response.get_data(as_text=True)

    def test_file_content_reading(self, client, valid_cert_data):
        """Test that file content is properly read"""
        with patch('api.v1.certificate_inspector.CertificateInspector') as mock_inspector_class:
            mock_inspector = Mock()
            mock_inspector.inspect.return_value = {
                "serial": "test",
                "subject": {},
                "issuer": {},
                "validity": {"not_before": "", "not_after": "", "is_valid": True},
                "extensions": [],
                "public_key_type": "RSA"
            }
            mock_inspector_class.return_value = mock_inspector

            data = {'certificate': (BytesIO(valid_cert_data), 'test.crt')}
            client.post('/v1/certificate/inspect', data=data, content_type='multipart/form-data')

            # Verify the exact content was passed to CertificateInspector
            mock_inspector_class.assert_called_once_with(valid_cert_data)