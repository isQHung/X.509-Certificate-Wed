"""
Unit tests for Certificate Inspector Service
Tests the CertificateInspector class and API endpoints
"""

import pytest
from unittest.mock import patch, MagicMock
from cryptography import x509
from cryptography.x509.oid import NameOID, ExtensionOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import datetime, timedelta, timezone
import json

from core.services.certificate_inspector import CertificateInspector


# ==========================================
# TEST DATA: Sample Certificate PEM
# ==========================================

def create_test_certificate_pem():
    """Create a test certificate PEM for testing"""
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    # Create subject
    subject = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, "test.example.com"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Test Organization"),
        x509.NameAttribute(NameOID.COUNTRY_NAME, "VN"),
    ])

    # Create certificate
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        subject  # Self-signed
    ).public_key(
        private_key.public_key()
    ).serial_number(
        123456789
    ).not_valid_before(
        datetime.now(timezone.utc)
    ).not_valid_after(
        datetime.now(timezone.utc) + timedelta(days=365)
    ).add_extension(
        x509.SubjectAlternativeName([
            x509.DNSName("test.example.com"),
            x509.DNSName("www.test.example.com"),
        ]),
        critical=False,
    ).add_extension(
        x509.BasicConstraints(ca=False, path_length=None),
        critical=True,
    ).add_extension(
        x509.KeyUsage(
            digital_signature=True,
            key_encipherment=True,
            content_commitment=False,
            data_encipherment=False,
            key_agreement=False,
            key_cert_sign=False,
            crl_sign=False,
            encipher_only=False,
            decipher_only=False
        ),
        critical=True,
    ).sign(private_key, hashes.SHA256())

    # Convert to PEM
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    return cert_pem


# ==========================================
# FIXTURE: Test Certificate
# ==========================================

@pytest.fixture
def test_cert_pem():
    """Fixture providing test certificate PEM"""
    return create_test_certificate_pem()


@pytest.fixture
def test_cert_inspector(test_cert_pem):
    """Fixture providing CertificateInspector instance"""
    return CertificateInspector(test_cert_pem)


# ==========================================
# 1. TEST INITIALIZATION
# ==========================================

def test_init_valid_certificate(test_cert_pem):
    """Test initialization with valid certificate"""
    inspector = CertificateInspector(test_cert_pem)
    assert inspector.certificate is not None
    assert isinstance(inspector.certificate, x509.Certificate)


def test_init_invalid_certificate():
    """Test initialization with invalid certificate data"""
    invalid_pem = b"-----BEGIN CERTIFICATE-----\nINVALID\n-----END CERTIFICATE-----"

    with pytest.raises(ValueError) as exc:
        CertificateInspector(invalid_pem)

    assert "Invalid certificate format" in str(exc.value)


def test_init_string_input():
    """Test initialization with string input (should convert to bytes)"""
    test_cert_pem = create_test_certificate_pem()
    cert_string = test_cert_pem.decode('utf-8')

    inspector = CertificateInspector(cert_string)
    assert inspector.certificate is not None


# ==========================================
# 2. TEST SUBJECT EXTRACTION
# ==========================================

def test_extract_subject(test_cert_inspector):
    """Test subject DN extraction"""
    subject = test_cert_inspector.extract_subject()

    assert isinstance(subject, dict)
    assert "commonName" in subject
    assert "organizationName" in subject
    assert "countryName" in subject
    assert subject["commonName"] == "test.example.com"
    assert subject["organizationName"] == "Test Organization"
    assert subject["countryName"] == "VN"


# ==========================================
# 3. TEST ISSUER EXTRACTION
# ==========================================

def test_extract_issuer(test_cert_inspector):
    """Test issuer DN extraction"""
    issuer = test_cert_inspector.extract_issuer()

    assert isinstance(issuer, dict)
    assert "commonName" in issuer
    assert issuer["commonName"] == "test.example.com"


# ==========================================
# 4. TEST SERIAL EXTRACTION
# ==========================================

def test_extract_serial(test_cert_inspector):
    """Test serial number extraction"""
    serial = test_cert_inspector.extract_serial()

    assert isinstance(serial, str)
    assert serial == "123456789"


# ==========================================
# 5. TEST VALIDITY EXTRACTION
# ==========================================

def test_extract_validity(test_cert_inspector):
    """Test validity period extraction"""
    validity = test_cert_inspector.extract_validity()

    assert isinstance(validity, dict)
    assert "not_before" in validity
    assert "not_after" in validity
    assert "is_valid" in validity
    assert isinstance(validity["is_valid"], bool)

    # Parse ISO format dates
    not_before = datetime.fromisoformat(validity["not_before"])
    not_after = datetime.fromisoformat(validity["not_after"])

    assert not_after > not_before


# ==========================================
# 6. TEST EXTENSIONS EXTRACTION
# ==========================================

def test_extract_extensions(test_cert_inspector):
    """Test certificate extensions extraction"""
    extensions = test_cert_inspector.extract_extensions()

    assert isinstance(extensions, list)

    # Should have at least Basic Constraints and Key Usage
    extension_names = [ext["name"] for ext in extensions]
    assert "Basic Constraints" in extension_names
    assert "Key Usage" in extension_names
    assert "Subject Alternative Names" in extension_names

    # Check Basic Constraints
    basic_constraints = next(ext for ext in extensions if ext["name"] == "Basic Constraints")
    assert basic_constraints["critical"] is True
    assert basic_constraints["value"]["ca"] is False

    # Check Key Usage
    key_usage = next(ext for ext in extensions if ext["name"] == "Key Usage")
    assert key_usage["critical"] is True
    assert key_usage["value"]["digital_signature"] is True
    assert key_usage["value"]["key_encipherment"] is True
    assert key_usage["value"]["key_agreement"] is False
    assert key_usage["value"]["encipher_only"] is None  # Only meaningful when key_agreement is True
    assert key_usage["value"]["decipher_only"] is None  # Only meaningful when key_agreement is True

    # Check Subject Alternative Names
    san_ext = next(ext for ext in extensions if ext["name"] == "Subject Alternative Names")
    assert san_ext["critical"] is False
    assert len(san_ext["value"]) == 2
    assert san_ext["value"][0]["type"] == "DNS"
    assert san_ext["value"][0]["value"] == "test.example.com"


def test_extract_extensions_no_extensions():
    """Test extensions extraction when certificate has no extensions"""
    # Create certificate without extensions
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "test.com")])

    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        subject
    ).public_key(
        private_key.public_key()
    ).serial_number(
        12345
    ).not_valid_before(
        datetime.now(timezone.utc)
    ).not_valid_after(
        datetime.now(timezone.utc) + timedelta(days=365)
    ).sign(private_key, hashes.SHA256())

    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    inspector = CertificateInspector(cert_pem)

    extensions = inspector.extract_extensions()
    assert extensions == []


# ==========================================
# 7. TEST COMPLETE INSPECTION
# ==========================================

def test_inspect_complete(test_cert_inspector):
    """Test complete certificate inspection"""
    result = test_cert_inspector.inspect()

    assert isinstance(result, dict)
    assert "serial" in result
    assert "subject" in result
    assert "issuer" in result
    assert "validity" in result
    assert "extensions" in result
    assert "public_key_type" in result

    assert result["serial"] == "123456789"
    assert result["subject"]["commonName"] == "test.example.com"
    assert result["public_key_type"] == "RSAPublicKey"


# ==========================================
# 8. TEST EDGE CASES
# ==========================================

def test_certificate_with_minimal_info():
    """Test certificate with minimal information"""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "minimal.com")])

    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        subject
    ).public_key(
        private_key.public_key()
    ).serial_number(
        1
    ).not_valid_before(
        datetime.now(timezone.utc)
    ).not_valid_after(
        datetime.now(timezone.utc) + timedelta(days=1)
    ).sign(private_key, hashes.SHA256())

    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    inspector = CertificateInspector(cert_pem)

    result = inspector.inspect()
    assert result["serial"] == "1"
    assert result["subject"]["commonName"] == "minimal.com"
    assert len(result["extensions"]) == 0  # No extensions added


def test_certificate_expired():
    """Test expired certificate"""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "expired.com")])

    # Create certificate that expired yesterday
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)

    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        subject
    ).public_key(
        private_key.public_key()
    ).serial_number(
        999
    ).not_valid_before(
        yesterday - timedelta(days=365)
    ).not_valid_after(
        yesterday
    ).sign(private_key, hashes.SHA256())

    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    inspector = CertificateInspector(cert_pem)

    validity = inspector.extract_validity()
    assert validity["is_valid"] is False


def test_certificate_future_validity():
    """Test certificate not yet valid"""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "future.com")])

    # Create certificate valid from tomorrow
    tomorrow = datetime.now(timezone.utc) + timedelta(days=1)

    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        subject
    ).public_key(
        private_key.public_key()
    ).serial_number(
        888
    ).not_valid_before(
        tomorrow
    ).not_valid_after(
        tomorrow + timedelta(days=365)
    ).sign(private_key, hashes.SHA256())

    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    inspector = CertificateInspector(cert_pem)

    validity = inspector.extract_validity()
    assert validity["is_valid"] is False