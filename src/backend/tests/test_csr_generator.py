import pytest
from unittest.mock import patch
from core.services.csr_generator import generate_csr


@patch("core.services.csr_generator.create_csr")
def test_generate_csr_returns_key_and_csr(mock_create_csr):
    mock_create_csr.return_value = "request-123"

    result = generate_csr({
        "subject": {
            "CN": "example.com",
            "O": "Test Org",
            "OU": "IT Department",
            "C": "VN",
            "ST": "Hanoi",
            "L": "Hoan Kiem",
        },
        "san": ["example.com", "www.example.com"],
    })

    assert result["request_id"] == "request-123"
    assert result["csr_pem"].startswith("-----BEGIN CERTIFICATE REQUEST-----")
    assert result["csr_pem"].strip().endswith("-----END CERTIFICATE REQUEST-----")
    assert result["private_key_pem"].startswith("-----BEGIN PRIVATE KEY-----")
    assert result["private_key_pem"].strip().endswith("-----END PRIVATE KEY-----")
    mock_create_csr.assert_called_once()


def test_generate_csr_rejects_missing_cn():
    with pytest.raises(ValueError, match="Common Name \(CN\) is required"):
        generate_csr({
            "subject": {
                "O": "Test Org"
            },
            "san": ["example.com"],
        })
