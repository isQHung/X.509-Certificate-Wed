import unittest
import datetime
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from core.crypto.cert_signer import CertSigner

class TestCertSigner(unittest.TestCase):
    def setUp(self):
        # 1. Tạo giả lập Root CA trên RAM
        self.root_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, u"Test Root CA")])
        root_cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer)\
            .public_key(self.root_key.public_key())\
            .serial_number(x509.random_serial_number())\
            .not_valid_before(datetime.datetime.now(datetime.timezone.utc))\
            .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=3650))\
            .sign(self.root_key, hashes.SHA256())
        
        self.root_cert_pem = root_cert.public_bytes(serialization.Encoding.PEM)
        self.root_key_pem = self.root_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )

        # 2. Tạo giả lập Client CSR
        self.client_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        csr = x509.CertificateSigningRequestBuilder().subject_name(x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, u"test.domain.com")
        ])).add_extension(
            x509.SubjectAlternativeName([x509.DNSName(u"test.domain.com")]),
            critical=False,
        ).sign(self.client_key, hashes.SHA256())
        self.csr_pem = csr.public_bytes(serialization.Encoding.PEM)

    def test_sign_csr_success_and_verify(self):
        # Chạy module logic
        signer = CertSigner(self.root_cert_pem, self.root_key_pem)
        cert_pem = signer.sign_csr(self.csr_pem, validity_days=365)
        
        # Load chứng chỉ vừa được tạo ra
        cert = x509.load_pem_x509_certificate(cert_pem)
        
        # Kiểm tra Subject và Issuer
        self.assertEqual(cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value, "test.domain.com")
        self.assertEqual(cert.issuer.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value, "Test Root CA")
        
        # Kiểm tra Extensions
        self.assertTrue(cert.extensions.get_extension_for_class(x509.KeyUsage))
        self.assertTrue(cert.extensions.get_extension_for_class(x509.SubjectAlternativeName))
        
        # KIỂM TRA MẬT MÃ (Test Case: openssl verify OK)
        # Lấy Public Key của Root CA để giải mã chữ ký trên cert mới. 
        # Nếu code chạy qua dòng này không báo lỗi InvalidSignature nghĩa là Test OK.
        self.root_key.public_key().verify(
            cert.signature,
            cert.tbs_certificate_bytes,
            padding.PKCS1v15(),
            cert.signature_hash_algorithm,
        )

if __name__ == '__main__':
    unittest.main()