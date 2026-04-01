"""Flask API tests for CRL endpoints (mock CrlService; no real Supabase)."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest
from flask.testing import FlaskClient

from main import app
from schema.database_schema import CRL
from schema.response import GenerateCrlResponse


@pytest.fixture
def client() -> FlaskClient:
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def _sample_crl() -> CRL:
    return CRL(
        id=uuid.uuid4(),
        version=1,
        generated_at=datetime.now(timezone.utc),
        next_update=datetime.now(timezone.utc) + timedelta(days=1),
        crl_pem="-----BEGIN X509 CRL-----\nMIIB\n-----END X509 CRL-----\n",
    )


@patch("api.v1.crl.CrlService")
def test_get_crl_generate_success(mock_svc_class, client: FlaskClient):
    mock_inst = MagicMock()
    mock_svc_class.return_value = mock_inst
    crl = _sample_crl()
    mock_inst.generate_crl.return_value = GenerateCrlResponse(crl=crl, revocations_moved=2)

    res = client.get("/api/v1/crl")

    assert res.status_code == 200
    data = res.get_json()
    assert data["revocations_moved"] == 2
    assert "crl" in data
    assert data["crl"]["version"] == 1
    assert data["crl"]["id"] == str(crl.id)
    assert "BEGIN X509 CRL" in data["crl"]["crl_pem"]
    mock_inst.generate_crl.assert_called_once()


@patch("api.v1.crl.CrlService")
def test_get_crl_generate_value_error_returns_400(mock_svc_class, client: FlaskClient):
    mock_inst = MagicMock()
    mock_svc_class.return_value = mock_inst
    mock_inst.generate_crl.side_effect = ValueError("KEY_PATH_CA và CERT_PATH_CA phải được cấu hình")

    res = client.get("/api/v1/crl")

    assert res.status_code == 400
    assert "KEY_PATH_CA" in res.get_json()["error"]


@patch("api.v1.crl.CrlService")
def test_get_crl_latest_success(mock_svc_class, client: FlaskClient):
    mock_inst = MagicMock()
    mock_svc_class.return_value = mock_inst
    crl = _sample_crl()
    mock_inst.get_latest_crl.return_value = crl

    res = client.get("/api/v1/crl/latest")

    assert res.status_code == 200
    data = res.get_json()
    assert data["id"] == str(crl.id)
    assert data["crl_pem"] == crl.crl_pem
    mock_inst.get_latest_crl.assert_called_once()


@patch("api.v1.crl.CrlService")
def test_get_crl_latest_returns_404_when_none(mock_svc_class, client: FlaskClient):
    mock_inst = MagicMock()
    mock_svc_class.return_value = mock_inst
    mock_inst.get_latest_crl.return_value = None

    res = client.get("/api/v1/crl/latest")

    assert res.status_code == 404
    assert "Chưa có CRL" in res.get_json()["error"]
