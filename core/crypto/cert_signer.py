import datetime
from cryptography import x509
from cryptography.x509.oid import ExtensionOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

class CertSigner:
    def __init__(self, root_cert_pem: bytes, root_key_pem: bytes):
        """Khởi tạo với Chứng chỉ Root CA (để lấy Issuer Name) và Khóa bí mật Root CA (để ký)"""
        self.root_cert = x509.load_pem_x509_certificate(root_cert_pem)
        self.root_key = serialization.load_pem_private_key(root_key_pem, password=None)

    def sign_csr(self, csr_pem: bytes, validity_days: int = 365) -> bytes:
        """Thực hiện ký CSR và trả về Chứng chỉ định dạng PEM"""
        csr = x509.load_pem_x509_csr(csr_pem)
        
        if not csr.is_signature_valid:
            raise ValueError("CSR signature is invalid")

        # Bắt đầu build chứng chỉ mới
        builder = x509.CertificateBuilder()
        
        # 1. AC: Serial Number duy nhất (Tạo ngẫu nhiên theo chuẩn x509)
        builder = builder.serial_number(x509.random_serial_number())
        
        # 2. Gắn Subject (Từ người gửi) và Issuer (Từ Root CA)
        builder = builder.subject_name(csr.subject)
        builder = builder.issuer_name(self.root_cert.subject)
        
        # 3. AC: Thời hạn (Validity)
        now = datetime.datetime.now(datetime.timezone.utc)
        builder = builder.not_valid_before(now)
        builder = builder.not_valid_after(now + datetime.timedelta(days=validity_days))
        
        # Gắn Public Key của người gửi lấy từ CSR
        builder = builder.public_key(csr.public_key())
        
        # 4. AC: Extensions (Key Usage)
        builder = builder.add_extension(
            x509.KeyUsage(
                digital_signature=True,
                key_encipherment=True,
                content_commitment=False,
                data_encipherment=False,
                key_agreement=False,
                key_cert_sign=False,
                crl_sign=False,
                encipher_only=False,
                decipher_only=False,
            ),
            critical=True,
        )
        
        # 5. AC: Extensions (SAN - Subject Alternative Name)
        # Bóc tách SAN từ CSR gốc sang chứng chỉ mới (nếu có)
        try:
            san_ext = csr.extensions.get_extension_for_oid(ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
            builder = builder.add_extension(san_ext.value, critical=False)
        except x509.ExtensionNotFound:
            pass # Nếu người dùng không gửi SAN thì bỏ qua
        
        # 6. Ký chứng chỉ bằng SHA256withRSA
        certificate = builder.sign(
            private_key=self.root_key,
            algorithm=hashes.SHA256(),
        )
        
        return certificate.public_bytes(serialization.Encoding.PEM)