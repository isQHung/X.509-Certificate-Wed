from core.crypto.csr_validator import CSRValidator
from core.crypto.RSA import RSACAService
from core.repository.cert_request import *
from schema.database_schema import  CertificateRequestCreate
import json
from cryptography import x509
from db.supabase_client import get_supabase_client

supabase = get_supabase_client()
repo = CertificateRequestRepository(supabase)

rsa_service = RSACAService()

def create_csr(data):
    csr_pem = data.get("csr_pem")
    if not csr_pem:
        raise Exception("CSR PEM is required")
    
    if isinstance(csr_pem, str):
        csr_pem = csr_pem.encode()

    validator = CSRValidator(csr_pem)
    validator.validate_signature()

    csr = x509.load_pem_x509_csr(csr_pem)

    subject = {attr.oid._name: attr.value for attr in csr.subject}
    san = []
    try:
        ext = csr.extensions.get_extension_for_class(x509.SubjectAlternativeName)
        san = ext.value.get_values_for_type(x509.DNSName)
    except x509.ExtensionNotFound:
        pass

    csr_req = CertificateRequestCreate(
        user_id=data.get("user_id"),  
        csr_pem=csr_pem.decode(),
        subject=json.dumps(subject),
        san=json.dumps(san),
    )

    req_id = repo.insert_csr(csr_req.model_dump(mode='json'))
    return req_id

def cancel_csr(req_id):
    csr = repo.get_csr_by_id(req_id)
    #  Check tồn tại
    if not csr:
        raise ValueError(f"CSR with ID {req_id} not found")

    #  Check trạng thái pending
    if csr["status"] != "pending":
        raise ValueError(f"Cannot cancel CSR with status '{csr['status']}'")
    
    repo.delete_csr(req_id)
    return req_id