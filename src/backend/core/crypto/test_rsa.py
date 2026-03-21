import os
from cryptography import x509
from RSA import RSACAService

def test_rsa_and_ca_flow():
    # Khởi tạo Service
    rsa_service = RSACAService(key_size=2048)
    
    # 1. Test Sinh Khóa
    print("1. Generating RSA Key Pair...")
    private_key, public_key = rsa_service.generate_key_pair()
    assert private_key.key_size == 2048, "Key size must be 2048"
    print("=> Key Pair generated successfully.")

    # 2. Test Sinh Root CA
    print("\n2. Generating Self-signed Root CA...")
    cert = rsa_service.generate_root_ca(private_key, public_key, "System_Root_CA_Example")
    
    # Kiểm tra Subject == Issuer
    assert cert.subject == cert.issuer, "Subject and Issuer must be identical for Root CA"
    
    # Kiểm tra Extension CA=True
    basic_constraints = cert.extensions.get_extension_for_oid(x509.oid.ExtensionOID.BASIC_CONSTRAINTS).value
    assert basic_constraints.ca is True, "Extension Basic Constraints must have CA=True"
    print("=> Root CA generated and verified logically.")

    # 3. Test Mã hóa / Giải mã RSA
    print("\n3. Testing RSA Encryption/Decryption...")
    original_message = b"Secret_Payload_For_Testing"
    
    # Mã hóa bằng Public Key
    ciphertext = rsa_service.encrypt(public_key, original_message)
    assert ciphertext != original_message, "Ciphertext must differ from Plaintext"
    
    # Giải mã bằng Private Key
    decrypted_message = rsa_service.decrypt(private_key, ciphertext)
    assert decrypted_message == original_message, "Decrypted message must match original plaintext"
    print("=> Encryption and Decryption OK.")

    # 4. Lưu ra file .example trong folder /secrets
    print("\n4. Saving files to /secrets...")
    secrets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'secrets')
    os.makedirs(secrets_dir, exist_ok=True)

    priv_key_path = os.path.join(secrets_dir, 'rootCA.key.example')
    cert_path = os.path.join(secrets_dir, 'rootCA.crt.example')

    with open(priv_key_path, 'wb') as f:
        f.write(rsa_service.serialize_private_key(private_key))
        
    with open(cert_path, 'wb') as f:
        f.write(rsa_service.serialize_cert(cert))
        
    print(f"=> Saved: {priv_key_path}")
    print(f"=> Saved: {cert_path}")
    print("\n[ALL TESTS PASSED - DEFINITION OF DONE MET]")

if __name__ == "__main__":
    test_rsa_and_ca_flow()