from core.crypto.csr_validator import CSRValidator
from core.crypto.RSA import RSACAService
from core.repository.approve import *
from datetime import datetime, timezone
from cryptography.hazmat.primitives import serialization
import os
from core.crypto.cert_signer import CertSigner
from schema.database_schema import CertificateCreate, CertificateRequest
from cryptography import x509
from db.supabase_client import get_supabase_client
from uuid import UUID

supabase = get_supabase_client()
repo = CertificateRepository(supabase)

rsa_service = RSACAService()

def approve_csr(req_id):
    db = repo.get_csr_by_id(req_id)

    if not db:
        raise Exception("CSR not found")

    csr_req = CertificateRequest(**db).model_dump(mode='json')

    if csr_req["status"] != "pending":
        raise Exception("Already processed")
    
    #validate CSR
    csr_pem = csr_req["csr_pem"]
    if isinstance(csr_pem, str):
        csr_pem = csr_pem.encode()

    validator = CSRValidator(csr_pem)

    # check chữ ký
    validator.validate_signature()

    # load pri key của CA và cert của CA
    ca_priv_key, ca_cert = rsa_service.load_root_ca_credentials(
        key_path=os.getenv("KEY_PATH_CA"),
        cert_path=os.getenv("CERT_PATH_CA")
    )

    signer = CertSigner(ca_cert,ca_priv_key)

    validity_days = csr_req.get("validity_days") or 365
    try:
        validity_days = int(validity_days)
    except (TypeError, ValueError) as exc:
        raise Exception("Invalid validity_days in certificate request") from exc
    if validity_days < 1 or validity_days > 3650:
        raise Exception("validity_days must be between 1 and 3650")
    
    # ký
    cert = signer.sign_csr(
        csr_pem=csr_req["csr_pem"].encode(),
        validity_days=validity_days,
    )

    cert = x509.load_pem_x509_certificate(cert)
    cert_pem = rsa_service.serialize_cert(cert).decode()
    serial = str(cert.serial_number)
    
    subject = csr_req["subject"]
    san = csr_req["san"]
    
    public_key = cert.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode()

    issuer_env = os.getenv("ISSUER_CA")
    issuer_id = None
    if issuer_env:
        try:
            parsed_id = UUID(issuer_env)
            # check if it exists in DB
            check = supabase.table("certificates").select("id").eq("id", str(parsed_id)).execute()
            if check.data:
                issuer_id = parsed_id
        except ValueError:
            pass

    cert_data = CertificateCreate(
        serial_number=str(cert.serial_number),
        issuer_id=issuer_id,
        subject=subject,
        san=san,
        public_key=public_key,
        valid_from=cert.not_valid_before.isoformat(),
        valid_to=cert.not_valid_after.isoformat(),
        status="active",
        certificate_pem=cert_pem,
        csr_id=csr_req["id"],
        created_at=datetime.now(timezone.utc).isoformat()
    )
    repo.save_certificate(cert_data.model_dump(mode='json'))
    
    # update DB
    csr_req["status"] = "issued"
    repo.update_csr_status(csr_req)
    repo.update_csr_time(csr_req)

    return serial

def reject_csr(req_id):
    db = repo.get_csr_by_id(req_id)

    if not db:
        raise Exception("CSR not found")

    csr_req = CertificateRequest(**db).model_dump()
    
    if csr_req["status"] != "pending":
        raise Exception("Already processed")
    
    # update DB
    csr_req["status"] = "rejected"
    repo.update_csr_status(csr_req)

    return"Rejected"

def list_pending_csr():
    db_records= repo.get_csr(status="pending")
    res = []
    for item in db_records:
        res.append(CertificateRequest(**item))
    return res