"""CSR generator service for FE-driven request creation."""

from typing import Any, Dict, List, Tuple

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, rsa
from cryptography.x509.oid import NameOID

from core.repository.cert_request import CertificateRequestRepository
from db.supabase_client import get_supabase_client
from schema.database_schema import CertificateRequestCreate

supabase = get_supabase_client()
repo = CertificateRequestRepository(supabase)
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


def _resolve_key_options(data: Dict[str, Any]) -> Tuple[str, int]:
    key_algorithm = str(data.get("key_algorithm", "RSA")).strip().upper()
    try:
        key_size = int(data.get("key_size", 2048))
    except (TypeError, ValueError) as exc:
        raise ValueError("key_size must be an integer") from exc

    if key_algorithm == "RSA":
        if key_size not in (2048, 3072, 4096):
            raise ValueError("RSA key_size must be one of: 2048, 3072, 4096")
        return key_algorithm, key_size

    if key_algorithm in ("EC", "ECDSA"):
        if key_size not in (256, 384):
            raise ValueError("EC key_size must be one of: 256, 384")
        return "EC", key_size

    raise ValueError("key_algorithm must be RSA or EC")


def _generate_private_key(key_algorithm: str, key_size: int):
    if key_algorithm == "RSA":
        return rsa.generate_private_key(public_exponent=65537, key_size=key_size)

    curve = ec.SECP256R1() if key_size == 256 else ec.SECP384R1()
    return ec.generate_private_key(curve)


def generate_csr(data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    if not user_id:
        raise PermissionError("User ID is required")

    alias = str(data.get("alias", "")).strip()
    if not alias:
        raise ValueError("Alias is required")

    key_algorithm, key_size = _resolve_key_options(data)

    try:
        validity_days = int(data.get("validity_days", 365))
    except (TypeError, ValueError) as exc:
        raise ValueError("validity_days must be an integer") from exc

    if validity_days < 1 or validity_days > 3650:
        raise ValueError("validity_days must be between 1 and 3650")

    subject_data = _normalize_subject(data.get("subject", {}))
    san_values = data.get("san", []) or []
    if isinstance(san_values, str):
        san_values = [item.strip() for item in san_values.split(",") if item.strip()]

    # Generate key pair + CSR from FE-provided subject/san
    subject = _build_subject(subject_data)
    san_extension = _build_san_extension(san_values)
    private_key = _generate_private_key(key_algorithm, key_size)

    csr_builder = x509.CertificateSigningRequestBuilder().subject_name(subject)
    if san_extension is not None:
        csr_builder = csr_builder.add_extension(san_extension, critical=False)

    csr = csr_builder.sign(private_key, hashes.SHA256())

    csr_pem = csr.public_bytes(serialization.Encoding.PEM).decode("utf-8")

    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    public_key = private_key.public_key()
    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode("utf-8")

    key_pair_id = None
    try:
        key_pair_payload = {
            "owner_id": user_id,
            "alias": alias,
            "key_type": key_algorithm,
            "key_size": key_size,
            "fingerprint": public_key_pem 
        }

        db_res = supabase.table("key_pairs").insert(key_pair_payload).execute()
        
        if db_res.data:
            key_pair_id = db_res.data[0]["id"]
            
    except Exception as exc:
        raise RuntimeError(f"Database Error (key_pairs): {exc}") from exc

    csr_req = CertificateRequestCreate(
        user_id=user_id,
        csr_pem=csr_pem,
        subject=subject_data,
        san=san_values,
        alias=alias,
        key_algorithm=key_algorithm,
        key_size=key_size,
        validity_days=validity_days,
    )
    request_id = repo.insert_csr(csr_req.model_dump(mode="json"))

    return {
        "key_pair_id": key_pair_id,
        "request_id": request_id,
        "csr_pem": csr_pem,
        "private_key_pem": private_key_pem,
        "public_key_pem": public_key_pem,
    }
