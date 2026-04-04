"""
CSR Generator Service
Generates a new RSA private key and Certificate Signing Request (CSR), then stores the CSR request in the database.
"""

import json
from uuid import UUID
from typing import Any, Dict, List

from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization

from core.crypto.RSA import RSACAService
from core.services.cert_request import create_csr

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
    subject_data = _normalize_subject(data.get("subject", {}))
    san_values = data.get("san", []) or []
    if isinstance(san_values, str):
        san_values = [item.strip() for item in san_values.split(",") if item.strip()]

    subject = _build_subject(subject_data)
    san_extension = _build_san_extension(san_values)

    rsa_service = RSACAService()
    private_key, _ = rsa_service.generate_key_pair()

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

    request_payload = {
        "user_id": data.get("user_id"),
        "csr_pem": csr_pem,
        "subject": json.dumps(subject_data),
        "san": json.dumps(san_values),
    }

    request_id = create_csr(request_payload)

    return {
        "request_id": request_id,
        "csr_pem": csr_pem,
        "private_key_pem": private_key_pem,
    }
