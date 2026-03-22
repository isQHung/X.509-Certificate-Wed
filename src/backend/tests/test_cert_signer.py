import pytest
import datetime
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature

# Import module từ core
from core.crypto.cert_signer import CertSigner

@pytest.fixture
def pki_mock_data():
    root_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, u"Test Root CA")])
    root_cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer)\
        .public_key(root_key.public_key()).serial_number(x509.random_serial_number())\
        .not_valid_before(datetime.datetime.now(datetime.timezone.utc))\
        .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=3650))\
        .sign(root_key, hashes.SHA256())
    
    root_cert_pem = root_cert.public_bytes(serialization.Encoding.PEM)
    root_key_pem = root_key.private_bytes(
        encoding=serialization.Encoding.PEM, format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )

    client_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    csr = x509.CertificateSigningRequestBuilder().subject_name(x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, u"test.domain.com")
    ])).add_extension(x509.SubjectAlternativeName([x509.DNSName(u"test.domain.com")]), critical=False)\
    .sign(client_key, hashes.SHA256())
    csr_pem = csr.public_bytes(serialization.Encoding.PEM)

    return root_cert_pem, root_key_pem, root_key, csr_pem

def test_sign_csr_strictly_meets_ac(pki_mock_data):
    root_cert_pem, root_key_pem, root_key, csr_pem = pki_mock_data
    signer = CertSigner(root_cert_pem, root_key_pem)
    
    cert_pem_1 = signer.sign_csr(csr_pem, validity_days=365)
    cert_pem_2 = signer.sign_csr(csr_pem, validity_days=365)
    
    cert1 = x509.load_pem_x509_certificate(cert_pem_1)
    cert2 = x509.load_pem_x509_certificate(cert_pem_2)
    
    # Kiem tra cac tieu chi (Serial, Extensions, Thuat toan)
    assert cert1.serial_number != cert2.serial_number
    assert cert1.extensions.get_extension_for_class(x509.KeyUsage).critical is True
    assert cert1.extensions.get_extension_for_class(x509.SubjectAlternativeName)
    assert isinstance(cert1.signature_hash_algorithm, hashes.SHA256)
    
    delta = cert1.not_valid_after_utc - cert1.not_valid_before_utc
    assert delta.days == 365
    
    # CHECK CHU KY CUC KY CHAT CHE
    try:
        root_key.public_key().verify(
            cert1.signature, cert1.tbs_certificate_bytes,
            padding.PKCS1v15(), cert1.signature_hash_algorithm,
        )
    except InvalidSignature:
        pytest.fail("Signature verification failed: The generated certificate has an invalid signature.")