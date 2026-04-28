from typing import Any, Dict, Tuple

from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec, rsa
from cryptography.x509.oid import NameOID

SUBJECT_OIDS = {
    "CN": NameOID.COMMON_NAME,
    "O": NameOID.ORGANIZATION_NAME,
    "OU": NameOID.ORGANIZATIONAL_UNIT_NAME,
    "C": NameOID.COUNTRY_NAME,
    "ST": NameOID.STATE_OR_PROVINCE_NAME,
    "L": NameOID.LOCALITY_NAME,
}


def resolve_key_options(data: Dict[str, Any]) -> Tuple[str, int]:
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


def generate_private_key(key_algorithm: str, key_size: int):
    if key_algorithm == "RSA":
        return rsa.generate_private_key(public_exponent=65537, key_size=key_size)

    curve = ec.SECP256R1() if key_size == 256 else ec.SECP384R1()
    return ec.generate_private_key(curve)


def serialize_private_key(private_key) -> str:
    return private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")


def serialize_public_key(public_key) -> str:
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")


def load_public_key_pem(public_key_pem: str):
    if not isinstance(public_key_pem, str) or not public_key_pem.strip():
        raise ValueError("public_key_pem is required")

    return serialization.load_pem_public_key(public_key_pem.encode("utf-8"))


def normalize_subject(subject_data: Dict[str, Any]) -> Dict[str, str]:
    return {key: str(value).strip() for key, value in subject_data.items() if value}


def build_subject(subject_data: Dict[str, str]) -> x509.Name:
    if not subject_data or not subject_data.get("CN"):
        raise ValueError("Common Name (CN) is required")

    attributes = []
    for field, oid in SUBJECT_OIDS.items():
        value = subject_data.get(field)
        if value:
            attributes.append(x509.NameAttribute(oid, value))

    return x509.Name(attributes)


def build_san_extension(san_values):
    if not san_values:
        return None

    san_items = [value.strip() for value in san_values if isinstance(value, str) and value.strip()]
    if not san_items:
        return None

    return x509.SubjectAlternativeName([x509.DNSName(value) for value in san_items])