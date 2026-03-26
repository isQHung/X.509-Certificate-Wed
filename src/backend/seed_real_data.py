import uuid
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography import x509
from cryptography.x509.oid import NameOID
from dotenv import load_dotenv

load_dotenv()
from database.supabase import supabase

def generate_and_insert_csr():
    print("🚀 Đang tự động sinh CSR siêu chuẩn...")
    
    # 1. Sinh một khóa Private Key ảo bằng code
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    # 2. Dùng khóa đó để tạo ra nội dung CSR thật
    builder = x509.CertificateSigningRequestBuilder()
    builder = builder.subject_name(x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, u"Test Jira-20 Valid User"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"DevOps Team"),
    ]))
    csr = builder.sign(private_key, hashes.SHA256())
    
    # Ép ra chuỗi text chuẩn PEM
    valid_csr_pem = csr.public_bytes(serialization.Encoding.PEM).decode('utf-8')

    # 3. Đẩy vào Database
    csr_data = {
        "user_id": "11111111-2222-3333-4444-555555555555",
        "status": "pending",
        "csr_pem": valid_csr_pem,
        "subject": {"CN": "Test Jira-20 Valid User"}
    }

    res = supabase.table("certificate_requests").insert(csr_data).execute()
    new_id = res.data[0]["id"]
    
    print("✅ ĐÃ BƠM THÀNH CÔNG CSR CHUẨN VÀO DB!")
    print(f"👉 COPY MÃ ID NÀY ĐỂ TEST DUYỆT: {new_id}")

if __name__ == "__main__":
    generate_and_insert_csr()