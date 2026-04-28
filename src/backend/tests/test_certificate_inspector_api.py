"""Flask API tests for certificate inspect endpoint."""

from __future__ import annotations

from io import BytesIO
from typing import Generator
from unittest.mock import MagicMock, patch

import pytest
from flask.testing import FlaskClient

from main import app


@pytest.fixture
def client() -> Generator[FlaskClient, None, None]:
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


@patch("api.v1.certificate_inspector.CertificateInspector")
def test_inspect_certificate_success_includes_ca_validation(
    mock_inspector_class,
    client: FlaskClient,
):
    mock_instance = MagicMock()
    mock_instance.inspect.return_value = {
        "serial": "123",
        "subject": {"commonName": "example.com"},
        "issuer": {"commonName": "My System CA"},
        "validity": {
            "not_before": "2026-01-01T00:00:00+00:00",
            "not_after": "2027-01-01T00:00:00+00:00",
            "is_valid": True,
        },
        "extensions": [],
        "public_key_type": "RSAPublicKey",
        "ca_validation": {
            "issued_by_system_ca": True,
            "check_status": "ok",
            "message": "Certificate issuer matches system CA",
        },
    }
    mock_inspector_class.return_value = mock_instance

    data = {
        "certificate": (BytesIO(b"dummy cert content"), "sample.crt"),
    }

    res = client.post(
        "/api/v1/certificate/inspect",
        data=data,
        content_type="multipart/form-data",
    )

    assert res.status_code == 200
    payload = res.get_json()
    assert payload["serial"] == "123"
    assert payload["ca_validation"]["issued_by_system_ca"] is True
    assert payload["ca_validation"]["check_status"] == "ok"


@patch("api.v1.certificate_inspector.CertificateInspector")
def test_inspect_certificate_unavailable_ca_validation(
    mock_inspector_class,
    client: FlaskClient,
):
    mock_instance = MagicMock()
    mock_instance.inspect.return_value = {
        "serial": "123",
        "subject": {"commonName": "example.com"},
        "issuer": {"commonName": "External CA"},
        "validity": {
            "not_before": "2026-01-01T00:00:00+00:00",
            "not_after": "2027-01-01T00:00:00+00:00",
            "is_valid": True,
        },
        "extensions": [],
        "public_key_type": "RSAPublicKey",
        "ca_validation": {
            "issued_by_system_ca": False,
            "check_status": "unavailable",
            "message": "System CA certificate is not available",
        },
    }
    mock_inspector_class.return_value = mock_instance

    data = {
        "certificate": (BytesIO(b"dummy cert content"), "sample.pem"),
    }

    res = client.post(
        "/api/v1/certificate/inspect",
        data=data,
        content_type="multipart/form-data",
    )

    assert res.status_code == 200
    payload = res.get_json()
    assert payload["ca_validation"]["issued_by_system_ca"] is False
    assert payload["ca_validation"]["check_status"] == "unavailable"


def test_inspect_certificate_no_file(client: FlaskClient):
    res = client.post(
        "/api/v1/certificate/inspect",
        data={},
        content_type="multipart/form-data",
    )

    assert res.status_code == 400
    assert "No certificate file provided" in res.get_json()["error"]


def test_inspect_certificate_invalid_extension(client: FlaskClient):
    data = {
        "certificate": (BytesIO(b"dummy cert content"), "sample.txt"),
    }

    res = client.post(
        "/api/v1/certificate/inspect",
        data=data,
        content_type="multipart/form-data",
    )

    assert res.status_code == 400
    assert "Invalid file type" in res.get_json()["error"]


@patch("api.v1.certificate_inspector.CertificateInspector")
def test_inspect_certificate_invalid_certificate_returns_400(
    mock_inspector_class,
    client: FlaskClient,
):
    mock_inspector_class.side_effect = ValueError("Invalid certificate format")

    data = {
        "certificate": (BytesIO(b"invalid cert content"), "sample.cer"),
    }

    res = client.post(
        "/api/v1/certificate/inspect",
        data=data,
        content_type="multipart/form-data",
    )

    assert res.status_code == 400
    assert "Invalid certificate format" in res.get_json()["error"]
