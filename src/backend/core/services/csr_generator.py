"""
CSR Generator Service
Generates a new RSA private key and Certificate Signing Request (CSR), then stores the CSR request in the database.
"""

import json
from uuid import UUID
from typing import Any, Dict, List
from db.supabase_client import get_supabase_client

from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from db.supabase_client import get_supabase_client
from core.crypto.RSA import RSACAService
from core.services.cert_request import create_csr
from api.jwt_utils import get_user_id_from_payload
DEFAULT_USER_ID = UUID('00000000-0000-0000-0000-000000000000')
supabase = get_supabase_client()
SUBJECT_OIDS = {
    "CN": NameOID.COMMON_NAME,
    "O": NameOID.ORGANIZATION_NAME,
    "OU": NameOID.ORGANIZATIONAL_UNIT_NAME,
    "C": NameOID.COUNTRY_NAME,
    "ST": NameOID.STATE_OR_PROVINCE_NAME,
    "L": NameOID.LOCALITY_NAME,
}


def _build_subject(subject_data: Dict[str, str]) -> x509.Name:
    if not subject_data or not subject_data.get("CN"):
        raise ValueError("Common Name (CN) is required")

    attributes = []
    for field, oid in SUBJECT_OIDS.items():
        value = subject_data.get(field)
        if value:
            attributes.append(x509.NameAttribute(oid, value))

    return x509.Name(attributes)


def _build_san_extension(san_values: List[str]):
    if not san_values:
        return None

    san_items = [value.strip() for value in san_values if isinstance(value, str) and value.strip()]
    if not san_items:
        return None

    return x509.SubjectAlternativeName([x509.DNSName(value) for value in san_items])


def _normalize_subject(subject_data: Dict[str, Any]) -> Dict[str, str]:
    return {key: str(value).strip() for key, value in subject_data.items() if value}


def generate_csr(data: Dict[str, Any]) -> Dict[str, Any]:
    # 1. Chuẩn hóa dữ liệu đầu vào
    subject_data = _normalize_subject(data.get("subject", {}))
    san_values = data.get("san", []) or []
    if isinstance(san_values, str):
        san_values = [item.strip() for item in san_values.split(",") if item.strip()]

    # 2. Tạo cặp khóa và CSR
    subject = _build_subject(subject_data)
    san_extension = _build_san_extension(san_values)

    rsa_service = RSACAService()
    private_key, _ = rsa_service.generate_key_pair()

    csr_builder = x509.CertificateSigningRequestBuilder().subject_name(subject)
    if san_extension is not None:
        csr_builder = csr_builder.add_extension(san_extension, critical=False)

    csr = csr_builder.sign(private_key, hashes.SHA256())
    
    # 3. Chuyển đổi sang định dạng PEM
    csr_pem = csr.public_bytes(serialization.Encoding.PEM).decode("utf-8")
    
    # Export Private Key
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    # --- MỚI: Trích xuất và Export Public Key để lưu vào fingerprint ---
    public_key = private_key.public_key()
    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode("utf-8")

    key_pair_id = None
    try:
        # 4. Lưu thông tin vào bảng key_pairs
        user_id = get_user_id_from_payload() or str(DEFAULT_USER_ID)
        
        key_pair_payload = {
            "owner_id": user_id,
            "key_type": "RSA",
            "key_size": 2048,
            "fingerprint": public_key_pem 
        }

        db_res = supabase.table("key_pairs").insert(key_pair_payload).execute()
        
        if db_res.data:
            key_pair_id = db_res.data[0]["id"]
            
    except Exception as e:
        print(f"Database Error (key_pairs): {e}")

    # 5. Lưu yêu cầu ký chứng chỉ vào bảng certificate_requests
    request_payload = {
        "user_id": get_user_id_from_payload() or str(DEFAULT_USER_ID),
        "csr_pem": csr_pem,
        "subject": json.dumps(subject_data),
        "san": json.dumps(san_values),
    }

    # Giữ nguyên hàm tạo CSR để lưu vào bảng certificate_requests
    # request_id = create_csr(request_payload)

    return {
        "key_pair_id": key_pair_id,
        "request_id": "local_null",
        "csr_pem": csr_pem,
        "private_key_pem": private_key_pem,
        "public_key_pem": public_key_pem # Trả thêm public key về cho frontend nếu cần
    }
