"""Flask API tests for audit logs endpoint (mock AuditLogService; no real Supabase)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from flask.testing import FlaskClient

from main import app


@pytest.fixture
def client() -> FlaskClient:
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


@patch("api.v1.audit_logs.AuditLogService")
def test_get_audit_logs_default_success(mock_svc_class, client: FlaskClient):
    mock_inst = MagicMock()
    mock_svc_class.return_value = mock_inst
    mock_inst.list_audit_logs.return_value = {
        "data": [],
        "total": 0,
        "page": 1,
        "limit": 10,
        "total_pages": 0,
    }

    res = client.get("/api/v1/audit_logs/")

    assert res.status_code == 200
    data = res.get_json()
    assert set(data.keys()) == {"data", "total", "page", "limit", "total_pages"}
    mock_inst.list_audit_logs.assert_called_once()


@patch("api.v1.audit_logs.AuditLogService")
def test_get_audit_logs_with_query_params_success(mock_svc_class, client: FlaskClient):
    mock_inst = MagicMock()
    mock_svc_class.return_value = mock_inst
    mock_inst.list_audit_logs.return_value = {
        "data": [],
        "total": 0,
        "page": 2,
        "limit": 5,
        "total_pages": 0,
    }

    res = client.get(
        "/api/v1/audit_logs/?page=2&limit=5&sort_by=created_at&sort_order=asc&action=UPDATE"
    )

    assert res.status_code == 200
    mock_inst.list_audit_logs.assert_called_once()


def test_get_audit_logs_invalid_actor_id_returns_400(client: FlaskClient):
    res = client.get("/api/v1/audit_logs/?actor_id=not-a-uuid")
    assert res.status_code == 400
    assert "error" in res.get_json()


def test_get_audit_logs_invalid_sort_by_returns_400(client: FlaskClient):
    res = client.get("/api/v1/audit_logs/?sort_by=drop_table")
    assert res.status_code == 400
    assert "error" in res.get_json()

