import datetime
from cryptography import x509
from cryptography.x509.oid import ExtensionOID
from cryptography.hazmat.primitives import hashes, serialization

class CertSigner:
    def __init__(self, root_cert_pem: bytes, root_key_pem: bytes):
        self.root_cert = x509.load_pem_x509_certificate(root_cert_pem)
        self.root_key = serialization.load_pem_private_key(root_key_pem, password=None)

    def sign_csr(self, csr_pem: bytes, validity_days: int = 365) -> bytes:
        csr = x509.load_pem_x509_csr(csr_pem)
        if not csr.is_signature_valid:
            raise ValueError("CSR signature is invalid")

        builder = x509.CertificateBuilder()
        # AC 1: Serial Number duy nhất
        builder = builder.serial_number(x509.random_serial_number())
        builder = builder.subject_name(csr.subject)
        builder = builder.issuer_name(self.root_cert.subject)
        
        # AC 3: Thời hạn (Validity)
        now = datetime.datetime.now(datetime.timezone.utc)
        builder = builder.not_valid_before(now)
        builder = builder.not_valid_after(now + datetime.timedelta(days=validity_days))
        builder = builder.public_key(csr.public_key())
        
        # AC 2: Extensions (Key Usage)
        builder = builder.add_extension(
            x509.KeyUsage(
                digital_signature=True, key_encipherment=True,
                content_commitment=False, data_encipherment=False,
                key_agreement=False, key_cert_sign=False, crl_sign=False,
                encipher_only=False, decipher_only=False,
            ), critical=True,
        )
        
        # AC 2: Extensions (SAN)
        try:
            san_ext = csr.extensions.get_extension_for_oid(ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
            builder = builder.add_extension(san_ext.value, critical=False)
        except x509.ExtensionNotFound:
            pass 
        
        # AC 5: Ký bằng SHA256withRSA
        certificate = builder.sign(private_key=self.root_key, algorithm=hashes.SHA256())
        return certificate.public_bytes(serialization.Encoding.PEM)