from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives.asymmetric import rsa, ec

class CSRValidator:
    def __init__(self, pem_data: bytes):
        """Khởi tạo và parse CSR từ dữ liệu PEM"""
        try:
            self.csr = x509.load_pem_x509_csr(pem_data)
        except Exception as e:
            raise ValueError(f"Không thể parse file CSR: {e}")

    def extract_info(self) -> dict:
        """Trích xuất CN, Org, Country và Public Key (Thỏa mãn AC 1)"""
        subject = self.csr.subject
        
        # Hàm helper để lấy giá trị theo OID an toàn
        def get_attr(oid):
            attributes = subject.get_attributes_for_oid(oid)
            return attributes[0].value if attributes else None

        return {
            "CN": get_attr(NameOID.COMMON_NAME),
            "Org": get_attr(NameOID.ORGANIZATION_NAME),
            "Country": get_attr(NameOID.COUNTRY_NAME),
            "PublicKey": self.csr.public_key()
        }

    def validate_signature(self) -> bool:
        """Kiểm tra chữ ký số của CSR (Thỏa mãn AC 2)"""
        if not self.csr.is_signature_valid:
            # Trả về đúng thông báo lỗi theo Test Case yêu cầu
            raise ValueError("Invalid Signature")
        return True