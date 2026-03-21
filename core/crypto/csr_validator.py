from cryptography import x509
from cryptography.x509.oid import NameOID

class CSRValidator:
    def __init__(self, pem_data: bytes):
        try:
            self.csr = x509.load_pem_x509_csr(pem_data)
        except Exception as e:
            raise ValueError(f"Invalid CSR format: {e}")

    def extract_info(self) -> dict:
        def get_attr(oid):
            attrs = self.csr.subject.get_attributes_for_oid(oid)
            return attrs[0].value if attrs else None

        return {
            "CN": get_attr(NameOID.COMMON_NAME),
            "Org": get_attr(NameOID.ORGANIZATION_NAME),
            "Country": get_attr(NameOID.COUNTRY_NAME),
            "PublicKey": self.csr.public_key() # Rút Public Key theo đúng AC
        }

    def validate_signature(self) -> bool:
        if not self.csr.is_signature_valid:
            raise ValueError("Invalid Signature")
        return True