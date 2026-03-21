import unittest
from unittest.mock import patch
from csr_validator import CSRValidator
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography import x509
from cryptography.x509.oid import NameOID

class TestCSRValidator(unittest.TestCase):
    def setUp(self):
        # Tạo nhanh một CSR hợp lệ để test trên RAM
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        builder = x509.CertificateSigningRequestBuilder().subject_name(x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, u"test.example.com"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"SecTeam"),
            x509.NameAttribute(NameOID.COUNTRY_NAME, u"VN"),
        ]))
        self.valid_csr = builder.sign(private_key, hashes.SHA256())
        from cryptography.hazmat.primitives import serialization
        self.valid_pem = self.valid_csr.public_bytes(serialization.Encoding.PEM)

    def test_extract_info(self):
        validator = CSRValidator(self.valid_pem)
        info = validator.extract_info()
        self.assertEqual(info["CN"], "test.example.com")
        self.assertEqual(info["Org"], "SecTeam")
        self.assertEqual(info["Country"], "VN")
        self.assertIsNotNone(info["PublicKey"])

    def test_validate_signature_success(self):
        validator = CSRValidator(self.valid_pem)
        self.assertTrue(validator.validate_signature())

    # Giả lập Test Case: File bị chỉnh sửa sau khi ký -> Chữ ký không khớp
    @patch('cryptography.x509.CertificateSigningRequest.is_signature_valid', new_callable=unittest.mock.PropertyMock)
    def test_invalid_signature(self, mock_is_valid):
        # Ép hàm is_signature_valid trả về False để giả lập CSR bị giả mạo
        mock_is_valid.return_value = False 
        
        validator = CSRValidator(self.valid_pem)
        with self.assertRaises(ValueError) as context:
            validator.validate_signature()
            
        # Kiểm tra đúng thông báo lỗi "Invalid Signature"
        self.assertEqual(str(context.exception), "Invalid Signature")

if __name__ == '__main__':
    unittest.main()