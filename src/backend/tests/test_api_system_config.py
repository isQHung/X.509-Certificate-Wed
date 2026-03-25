import json
from flask.testing import FlaskClient
import pytest
from main import app 

@pytest.fixture
def client() -> FlaskClient:
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client

# tests/test_system_config.py

import uuid

def test_health_check(client: FlaskClient):
    res = client.get("/health")
    assert res.status_code == 200

payload_test = {
        "name": "test-config",
        "key_algorithm": "RSA",
        "key_size": 2048,
        "signature_algorithm": "SHA256",
        "hash_algorithm": "SHA256",
        "default_validity_days": 365
    }

id_test:str = None

def test_create_config(client: FlaskClient):

    res = client.post("/api/v1/system_config/", json=payload_test)

    assert res.status_code == 201
    data = res.get_json()

    assert data["name"] == payload_test["name"]
    assert "id" in data
    global id_test 
    id_test = data["id"]


def test_get_all_configs(client):
    res = client.get("/api/v1/system_config/")

    assert res.status_code == 200
    data = res.get_json()

    assert isinstance(data, list)


def test_get_config_by_id(client):
    # create trước

    res = client.get(f"/api/v1/system_config/{id_test}")

    assert res.status_code == 200
    data = res.get_json()
    assert data["id"] == id_test


def test_get_config_by_name(client):

    res = client.get(f"/api/v1/system_config/by-name/{payload_test["name"]}")

    assert res.status_code == 200
    data = res.get_json()
    assert data["name"] == payload_test["name"]


def test_update_config(client):
    
    update_payload = {
        "key_algorithm": "ECDSA",
        "key_size": 256
    }

    res = client.put(f"/api/v1/system_config/{id_test}", json=update_payload)

    assert res.status_code == 200
    data = res.get_json()

    assert data["key_algorithm"] == "ECDSA"
    assert data["key_size"] == 256


def test_delete_config(client):
    
    res = client.delete(f"/api/v1/system_config/{id_test}")

    assert res.status_code == 200

    # verify deleted
    res_check = client.get(f"/api/v1/system_config/{id_test}")
    assert res_check.status_code == 404