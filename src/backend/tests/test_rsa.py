import os
import pytest
from core.crypto.RSA import RSACAService
from cryptography import x509


@pytest.fixture
def rsa_service():
    return RSACAService()


def test_generate_key_pair(rsa_service):
    private_key, public_key = rsa_service.generate_key_pair()
    assert private_key.key_size == 2048


def test_generate_root_ca(rsa_service):
    private_key, public_key = rsa_service.generate_key_pair()
    cert = rsa_service.generate_root_ca(private_key, public_key, "System_Root_CA_Example")

    # Subject == Issuer
    assert cert.subject == cert.issuer

    # CA = True
    basic_constraints = cert.extensions.get_extension_for_oid(
        x509.oid.ExtensionOID.BASIC_CONSTRAINTS
    ).value
    assert basic_constraints.ca is True


def test_rsa_encrypt_decrypt(rsa_service):
    private_key, public_key = rsa_service.generate_key_pair()
    original_message = b"Secret_Payload_For_Testing"

    ciphertext = rsa_service.encrypt(public_key, original_message)
    assert ciphertext != original_message

    decrypted_message = rsa_service.decrypt(private_key, ciphertext)
    assert decrypted_message == original_message


def test_save_files(rsa_service, tmp_path):
    private_key, public_key = rsa_service.generate_key_pair()
    cert = rsa_service.generate_root_ca(private_key, public_key, "System_Root_CA_Example")

    priv_key_path = tmp_path / "rootCA.key.example"
    cert_path = tmp_path / "rootCA.crt.example"

    priv_key_path.write_bytes(rsa_service.serialize_private_key(private_key))
    cert_path.write_bytes(rsa_service.serialize_cert(cert))

    assert priv_key_path.exists()
    assert cert_path.exists()