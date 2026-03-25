import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routers.admin_revoke import router
from core.models.mock_db import certificates_db, pending_revocation_requests, crl_table

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_get_pending_list():
    response = client.post("/api/v1/admin/revoke/list")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "success"
    assert data["total_pending"] == 1
    assert data["data"][0]["serial"] == "001"

def test_approve_revocation_success():
    serial_to_revoke = "001"
    
    response = client.post(f"/api/v1/admin/revoke/{serial_to_revoke}")
    assert response.status_code == 200
    
    assert certificates_db[serial_to_revoke]["status"] == "REVOKED"
    
    assert serial_to_revoke not in pending_revocation_requests
    
    assert len(crl_table) == 1
    assert crl_table[0]["serial"] == serial_to_revoke
    assert crl_table[0]["reason"] == "Lộ Private Key"

def test_approve_revocation_not_found():
    response = client.post("/api/v1/admin/revoke/999")
    
    assert response.status_code == 400
    assert "Khong tim thay yeu cau thu hoi" in response.json()["detail"]