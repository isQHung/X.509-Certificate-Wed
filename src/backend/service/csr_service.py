import os
from datetime import datetime, timezone
from cryptography import x509
from cryptography.hazmat.primitives import serialization
import json
from database.supabase import supabase
from schema.database_schema import CertificateCreate
from core.crypto.cert_signer import CertSigner
from core.validator.csr_validator import CSRValidator

def get_csr_by_id(req_id: str) -> dict | None:
    res = supabase.table("certificate_requests").select("*").eq("id", req_id).execute()
    return res.data[0] if res.data else None

def list_pending_csr() -> list:
    res = supabase.table("certificate_requests").select("*").eq("status", "pending").execute()
    return res.data or []

def approve_csr(req_id: str) -> dict:
    csr_req = get_csr_by_id(req_id)
    if not csr_req:
        raise ValueError("CSR not found")
    
    if csr_req.get("status") != "pending":
        raise ValueError("CSR is not in pending status")

    csr_pem_bytes = csr_req.get("csr_pem").encode('utf-8')

    validator = CSRValidator(csr_pem_bytes)
    validator.validate_signature()

    with open(os.getenv("CERT_PATH_CA"), "rb") as f:
        root_cert_pem = f.read()
    with open(os.getenv("KEY_PATH_CA"), "rb") as f:
        root_key_pem = f.read()

    signer = CertSigner(root_cert_pem=root_cert_pem, root_key_pem=root_key_pem)
    cert_pem_bytes = signer.sign_csr(csr_pem=csr_pem_bytes)

    parsed_cert = x509.load_pem_x509_certificate(cert_pem_bytes)
    
    public_key_pem = parsed_cert.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')

    subject_raw = csr_req.get("subject")
    san_raw = csr_req.get("san")

    cert_payload = CertificateCreate(
        serial_number=str(parsed_cert.serial_number),
        issuer_id=None, # Tạm để None để bypass khóa ngoại lúc test
        subject=json.dumps(subject_raw) if subject_raw else None,
        san=json.dumps(san_raw) if san_raw else None,
        public_key=public_key_pem,
        valid_from=parsed_cert.not_valid_before_utc.isoformat(),
        valid_to=parsed_cert.not_valid_after_utc.isoformat(),
        status="active",
        certificate_pem=cert_pem_bytes.decode('utf-8'),
        csr_id=req_id
    ).model_dump(mode='json')

    supabase.table("certificates").insert(cert_payload).execute()
    
    supabase.table("certificate_requests").update({
        "status": "issued", 
        "approved_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", req_id).execute()
    
    return {"message": "Certificate issued", "serial": cert_payload["serial_number"]}

def reject_csr(req_id: str) -> dict:
    csr_req = get_csr_by_id(req_id)
    if not csr_req:
        raise ValueError("CSR not found")
        
    if csr_req.get("status") != "pending":
        raise ValueError("CSR is not in pending status")

    supabase.table("certificate_requests").update({"status": "rejected"}).eq("id", req_id).execute()
    
    return {"message": "CSR rejected"}