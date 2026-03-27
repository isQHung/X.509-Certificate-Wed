import pytest
from flask import Flask
from unittest.mock import patch
from datetime import datetime, timezone
import uuid
from api.v1.approve import admin_bp 


# --- FIXTURE ---
@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(admin_bp, url_prefix="/api/v1")
    return app


@pytest.fixture
def client(app):
    return app.test_client()


# =========================
# 1. LIST PENDING CSR
# =========================
@patch("api.v1.approve.list_pending_csr")
def test_list_pending_csr(mock_list_pending_csr, client):
    # Cập nhật dữ liệu giả với ĐẦY ĐỦ các trường bắt buộc của schema
    mock_list_pending_csr.return_value = [
        {
            "id": uuid.uuid4(),
            "user_id": str(uuid.uuid4()),
            "status": "pending",
            "subject": {"CN": "example1.com"},  
            "san": {"DNS": ["example1.com", "www.example1.com"]}, 
            "created_at": datetime.now(timezone.utc).isoformat() 
        },
        {
            "id": uuid.uuid4(),
            "user_id": str(uuid.uuid4()),
            "status": "pending",
            "subject": {"CN": "example2.com"},
            "san": {"DNS": ["example2.com"]},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

    response = client.get("/api/v1/approve/list")

    print(response.status_code)
    print(response.json)

    assert response.status_code == 200
    assert "pending_requests" in response.json
    assert len(response.json["pending_requests"]) == 2
    for item in response.json["pending_requests"]:
        assert "id" in item
        assert "status" in item
        assert item["status"] == "pending"


# =========================
# 2. REJECT SUCCESS
# =========================
@patch("api.v1.approve.reject_csr")
def test_reject_csr_success(mock_reject_csr, client):
    test_id = uuid.uuid4()

    mock_reject_csr.return_value = "Rejected"

    response = client.post(f"/api/v1/reject/{test_id}")

    assert response.status_code == 200
    assert response.json["message"] == "Rejected"

    mock_reject_csr.assert_called_once_with(test_id)


# =========================
# 3. REJECT FAIL
# =========================
@patch("api.v1.approve.reject_csr")
def test_reject_csr_fail(mock_reject_csr, client):
    test_id = uuid.uuid4()

    mock_reject_csr.side_effect = Exception("Already processed")

    response = client.post(f"/api/v1/reject/{test_id}")

    assert response.status_code == 400
    assert "Already processed" in response.json["error"]

    mock_reject_csr.assert_called_once_with(test_id)


# =========================
# 4. APPROVE SUCCESS
# =========================
@patch("api.v1.approve.approve_csr")
def test_approve_csr_success(mock_approve_csr, client):
    test_id = uuid.uuid4()

    mock_approve_csr.return_value = "999888777"

    response = client.post(f"/api/v1/approve/{test_id}")

    assert response.status_code == 200
    assert response.json["message"] == "CSR approved successfully"
    assert response.json["serial"] == "999888777"

    mock_approve_csr.assert_called_once_with(test_id)


# =========================
# 5. APPROVE FAIL
# =========================
@patch("api.v1.approve.approve_csr")
def test_approve_csr_fail(mock_approve_csr, client):
    test_id = uuid.uuid4()

    mock_approve_csr.side_effect = Exception("CSR not found")

    response = client.post(f"/api/v1/approve/{test_id}")

    assert response.status_code == 400
    assert "CSR not found" in response.json["error"]

    mock_approve_csr.assert_called_once_with(test_id)