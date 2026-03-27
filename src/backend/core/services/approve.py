from core.crypto.csr_validator import CSRValidator
from core.crypto.RSA import RSACAService
from core.repository.approve import *
from datetime import datetime, timezone
from cryptography.hazmat.primitives import serialization
import os
from core.crypto.cert_signer import CertSigner

rsa_service = RSACAService()


def approve_csr(req_id):
    csr_req = get_csr_by_id(req_id)

    if not csr_req:
        raise Exception("CSR not found")

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
    
    # ký
    cert = signer.sign_csr(
        csr_pem=csr_req["csr_pem"].encode(),
        ca_private_key=ca_priv_key,
        ca_cert=ca_cert
    )

    cert_pem = rsa_service.serialize_cert(cert).decode()
    serial = str(cert.serial_number)
    
    subject = csr_req["subject"]
    san = csr_req["san"]
    
    public_key = cert.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode()

    save_certificate({

        "serial_number": str(cert.serial_number),
        "issuer_id": os.getenv("ISSUER_CA"),
        "subject": subject,
        "san": san,

        "public_key": public_key,

        "valid_from": cert.not_valid_before.isoformat(),
        "valid_to": cert.not_valid_after.isoformat(),

        "status": "active",
        "certificate_pem": cert_pem,
        "csr_id": csr_req["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # update DB
    csr_req["status"] = "issued"
    update_csr_status(csr_req)
    update_csr_time(csr_req)

    return serial

def reject_csr(req_id):
    csr_req = get_csr_by_id(req_id)

    if not csr_req:
        raise Exception("CSR not found")

    if csr_req["status"] != "pending":
        raise Exception("Already processed")
    
    # update DB
    csr_req["status"] = "rejected"
    update_csr_status(csr_req)

    return {"message": "Rejected"}

def list_pending_csr():
    res= get_csr(status="pending")
    return res