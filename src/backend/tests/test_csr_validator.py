import pytest
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography import x509
from cryptography.x509.oid import NameOID

# Lưu ý: Tuỳ thuộc vào cách cậu setup PYTHONPATH hoặc thư mục chạy lệnh test,
# có thể cậu sẽ cần sửa lại thành 'from src.backend.core.crypto.csr_validator import CSRValidator'
# Nhưng nếu cậu cd vào thư mục backend trước khi chạy test thì giữ nguyên dòng dưới đây:
from core.crypto.csr_validator import CSRValidator

@pytest.fixture
def valid_csr_pem():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    builder = x509.CertificateSigningRequestBuilder().subject_name(x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, u"test.yas.com"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"YasTeam"),
        x509.NameAttribute(NameOID.COUNTRY_NAME, u"VN"),
    ]))
    csr = builder.sign(private_key, hashes.SHA256())
    return csr.public_bytes(serialization.Encoding.PEM)

def test_extract_info_correctly(valid_csr_pem):
    validator = CSRValidator(valid_csr_pem)
    info = validator.extract_info()
    
    # Assert đúng từng field một theo AC mà anh Hùng yêu cầu
    assert info["CN"] == "test.yas.com"
    assert info["Org"] == "YasTeam"
    assert info["Country"] == "VN"
    assert info["PublicKey"] is not None # Kiểm tra có lấy được Public Key không

def test_validate_signature_success(valid_csr_pem):
    validator = CSRValidator(valid_csr_pem)
    assert validator.validate_signature() is True

def test_validate_signature_tampered(valid_csr_pem, monkeypatch):
    # Giả lập chữ ký bị sai
    monkeypatch.setattr('cryptography.x509.CertificateSigningRequest.is_signature_valid', False)
    validator = CSRValidator(valid_csr_pem)
    
    # Assert đúng câu lỗi "Invalid Signature" theo Test Case yêu cầu
    with pytest.raises(ValueError, match="Invalid Signature"):
        validator.validate_signature()