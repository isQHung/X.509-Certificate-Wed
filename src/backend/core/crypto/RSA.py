import os
import datetime
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography import x509
from cryptography.x509.oid import NameOID
from core.crypto.AES import CryptoService

class RSACAService:
    def __init__(self):
        self.key_size = int(os.getenv("RSA_KEY_SIZE", 2048))
        self.validity_days = int(os.getenv("CA_VALIDITY_DAYS", 3650))
        self.org_name = os.getenv("CA_ORG_NAME", "Default System Root CA")
        self.country_name = os.getenv("CA_COUNTRY_NAME", "VN")
        self.key_passphrase = os.getenv("CA_PRIVATE_KEY_PASSPHRASE")

    def generate_key_pair(self):
        """Sinh cặp khóa RSA theo chuẩn."""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=self.key_size,
        )
        public_key = private_key.public_key()
        return private_key, public_key

    def generate_root_ca(self, private_key, public_key, common_name: str) -> x509.Certificate:
        """Tạo Self-signed Root CA (Subject == Issuer, CA=True)."""
        # Subject và Issuer giống nhau cho Root CA
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, common_name),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, self.org_name),
            x509.NameAttribute(NameOID.COUNTRY_NAME, self.country_name),
        ])

        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            public_key
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.now(datetime.UTC)
        ).not_valid_after(
            datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=self.validity_days)
        ).add_extension(
            # Basic Constraints: CA=True -> Xác định đây là Certificate Authority
            x509.BasicConstraints(ca=True, path_length=None),
            critical=True,
        ).sign(private_key, hashes.SHA256()) # Ký bằng chính Private Key của nó

        return cert

    def encrypt(self, public_key, plaintext: bytes) -> bytes:
        """Mã hóa dữ liệu bằng Public Key."""
        ciphertext = public_key.encrypt(
            plaintext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return ciphertext

    def decrypt(self, private_key, ciphertext: bytes) -> bytes:
        """Giải mã dữ liệu bằng Private Key."""
        plaintext = private_key.decrypt(
            ciphertext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return plaintext

    # --- xuất file  ---
    def serialize_private_key(self, private_key) -> bytes:
        pem_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )
        """có thể encrypt private key bằng AES"""
    #    pem_str = pem_bytes.decode("utf-8")
    #    crypto = CryptoService()
    #    encrypted_key = crypto.encrypt(pem_str)

        return pem_bytes  

    def serialize_cert(self, cert: x509.Certificate) -> bytes:
        return cert.public_bytes(serialization.Encoding.PEM)
    
    def sign_csr(self, csr_pem: bytes, ca_private_key, ca_cert: x509.Certificate, validity_days: int = 365) -> x509.Certificate:
        """Ký CSR bằng Root CA để tạo Leaf Certificate."""
        csr = x509.load_pem_x509_csr(csr_pem)
        
        if not csr.is_signature_valid:
            raise ValueError("Chữ ký của CSR không hợp lệ!")

        builder = x509.CertificateBuilder().subject_name(
            csr.subject
        ).issuer_name(
            ca_cert.subject
        ).public_key(
            csr.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.now(datetime.UTC)
        ).not_valid_after(
            datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=validity_days)
        )

        cert = builder.sign(ca_private_key, hashes.SHA256())
        return cert
    
    def load_private_key(self, pem_bytes: bytes, password: bytes = None):
        """Load Private Key từ chuỗi PEM (truyền password nếu lúc tạo có cài pass)."""
        return serialization.load_pem_private_key(
            pem_bytes,
            password=password,
        )

    def load_certificate(self, pem_bytes: bytes) -> x509.Certificate:
        """Load Certificate từ chuỗi PEM."""
        return x509.load_pem_x509_certificate(pem_bytes)
    
    def load_root_ca_credentials(self, key_path: str, cert_path: str):
    # đọc file key
        with open(key_path, "rb") as f:
            key_bytes = f.read()

        private_key = self.load_private_key(
            key_bytes,
            # password=self.key_passphrase.encode() if self.key_passphrase else None
            password=None
        )

    # đọc file cert
        with open(cert_path, "rb") as f:
            cert_bytes = f.read()

        cert = self.load_certificate(cert_bytes)

        return private_key, cert