import pytest
from flask import Flask
from unittest.mock import patch
import uuid
from api.v1.cert_request import customer_bp


# =========================
# FIXTURE
# =========================
@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(customer_bp, url_prefix="/v1")
    return app


@pytest.fixture
def client(app):
    return app.test_client()


# =========================
# 1. CREATE CSR SUCCESS
# =========================
@patch("api.v1.cert_request.create_csr")
def test_create_csr_success(mock_create_csr, client):
    payload = {
        "csr_pem": "-----BEGIN CERTIFICATE REQUEST-----...",
        "subject": {
            "CN": "example.com"
        },
        "san": ["example.com"]
    }

    mock_create_csr.return_value = None

    response = client.post("/v1/cert_request", json=payload)

    assert response.status_code == 200
    assert response.json["message"] == "CSR created successfully"

    mock_create_csr.assert_called_once_with(payload)


# =========================
# 2. CREATE CSR FAIL
# =========================
@patch("api.v1.cert_request.create_csr")
def test_create_csr_fail(mock_create_csr, client):
    payload = {}

    mock_create_csr.side_effect = Exception("Invalid CSR")

    response = client.post("/v1/cert_request", json=payload)

    assert response.status_code == 400
    assert "Invalid CSR" in response.json["error"]

    mock_create_csr.assert_called_once_with(payload)


# =========================
# 3. CANCEL CSR SUCCESS
# =========================
@patch("api.v1.cert_request.cancel_csr")
def test_cancel_csr_success(mock_cancel_csr, client):
    test_id = uuid.uuid4()  # vì route bạn đang dùng <int:req_id>

    mock_cancel_csr.return_value = "CSR cancelled successfully"

    response = client.post(f"/v1/cert_request/{test_id}/cancel")

    assert response.status_code == 200
    assert response.json["message"] == "CSR cancelled successfully"

    mock_cancel_csr.assert_called_once_with(test_id)


# =========================
# 4. CANCEL CSR NOT FOUND
# =========================
@patch("api.v1.cert_request.cancel_csr")
def test_cancel_csr_not_found(mock_cancel_csr, client):
    test_id = uuid.uuid4()

    mock_cancel_csr.side_effect = Exception("CSR not found")

    response = client.post(f"/v1/cert_request/{test_id}/cancel")

    assert response.status_code == 400
    assert "CSR not found" in response.json["error"]

    mock_cancel_csr.assert_called_once_with(test_id)


# =========================
# 5. CANCEL CSR INVALID STATUS
# =========================
@patch("api.v1.cert_request.cancel_csr")
def test_cancel_csr_invalid_status(mock_cancel_csr, client):
    test_id = uuid.uuid4()

    mock_cancel_csr.side_effect = Exception("Cannot cancel CSR with status 'approved'")

    response = client.post(f"/v1/cert_request/{test_id}/cancel")

    assert response.status_code == 400
    assert "Cannot cancel CSR" in response.json["error"]

    mock_cancel_csr.assert_called_once_with(test_id)