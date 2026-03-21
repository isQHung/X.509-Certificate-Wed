import datetime
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography import x509
from cryptography.x509.oid import NameOID

class RSACAService:
    def __init__(self, key_size: int = 2048):
        self.key_size = key_size

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
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "My System Root CA"),
            x509.NameAttribute(NameOID.COUNTRY_NAME, "VN"),
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
            # Root CA có thời hạn 10 năm
            datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=3650)
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
        return private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption() 
        )

    def serialize_cert(self, cert: x509.Certificate) -> bytes:
        return cert.public_bytes(serialization.Encoding.PEM)