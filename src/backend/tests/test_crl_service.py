"""Tests for CrlService (CRL generation with mocked DB via in-memory fake repository)."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional

import pytest
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID

from core.services.crl import CrlService
from schema.database_schema import CRL


@pytest.fixture
def ca_key_cert_pem(tmp_path):
    """Minimal CA key + cert on disk for load_root_ca_credentials."""
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "Test CA CRL")])
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.now(timezone.utc))
        .not_valid_after(datetime.now(timezone.utc) + timedelta(days=365))
        .sign(key, hashes.SHA256())
    )
    key_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    )
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    key_path = tmp_path / "ca.key"
    cert_path = tmp_path / "ca.crt"
    key_path.write_bytes(key_pem)
    cert_path.write_bytes(cert_pem)
    return key_path, cert_path


class FakeCrlRepository:
    """In-memory stand-in for Supabase-backed CrlRepository."""

    def __init__(self) -> None:
        self.revocations: List[dict[str, Any]] = []
        self.entries: List[dict[str, Any]] = []
        self.crls: List[dict[str, Any]] = []

    def list_revocations(self) -> List[dict[str, Any]]:
        return list(self.revocations)

    def delete_revocations_by_ids(self, revocation_ids: List[str | uuid.UUID]) -> None:
        ids = {str(i) for i in revocation_ids}
        self.revocations = [r for r in self.revocations if str(r["id"]) not in ids]

    def insert_crl_entries_many(self, rows: List[dict[str, Any]]) -> List[dict[str, Any]]:
        self.entries.extend(rows)
        return rows

    def list_all_crl_entries(self) -> List[dict[str, Any]]:
        return list(self.entries)

    def insert_crl(self, crl_row: dict[str, Any]) -> CRL:
        self.crls.append(crl_row)
        return CRL.model_validate(crl_row)

    def get_latest_crl(self) -> Optional[CRL]:
        if not self.crls:
            return None
        sorted_rows = sorted(self.crls, key=lambda r: r["generated_at"], reverse=True)
        return CRL.model_validate(sorted_rows[0])


def test_generate_crl_requires_ca_env(monkeypatch):
    monkeypatch.delenv("KEY_PATH_CA", raising=False)
    monkeypatch.delenv("CERT_PATH_CA", raising=False)
    svc = CrlService(repo=FakeCrlRepository())
    with pytest.raises(ValueError, match="KEY_PATH_CA"):
        svc.generate_crl()


def test_generate_crl_no_pending_produces_signed_crl(monkeypatch, ca_key_cert_pem):
    key_path, cert_path = ca_key_cert_pem
    monkeypatch.setenv("KEY_PATH_CA", str(key_path))
    monkeypatch.setenv("CERT_PATH_CA", str(cert_path))
    monkeypatch.setenv("CRL_NEXT_UPDATE_DAYS", "7")

    repo = FakeCrlRepository()
    svc = CrlService(repo=repo)
    out = svc.generate_crl()

    assert out.revocations_moved == 0
    assert "BEGIN X509 CRL" in out.crl.crl_pem
    assert out.crl.version == 1
    assert len(repo.crls) == 1
    # empty CRL still signed by CA
    crl_obj = x509.load_pem_x509_crl(out.crl.crl_pem.encode())
    assert isinstance(crl_obj.signature_hash_algorithm, hashes.SHA256)


def test_generate_crl_moves_revocations_to_entries(monkeypatch, ca_key_cert_pem):
    key_path, cert_path = ca_key_cert_pem
    monkeypatch.setenv("KEY_PATH_CA", str(key_path))
    monkeypatch.setenv("CERT_PATH_CA", str(cert_path))

    rid = str(uuid.uuid4())
    cid = str(uuid.uuid4())
    revoked_at = datetime.now(timezone.utc).replace(microsecond=0)

    repo = FakeCrlRepository()
    repo.revocations.append(
        {
            "id": rid,
            "certificate_id": cid,
            "serial_number": "987654321",
            "reason": "cessation_of_operation",
            "revoked_at": revoked_at.isoformat(),
        }
    )

    svc = CrlService(repo=repo)
    out = svc.generate_crl()

    assert out.revocations_moved == 1
    assert repo.revocations == []
    assert len(repo.entries) == 1
    assert repo.entries[0]["serial_number"] == "987654321"
    crl_obj = x509.load_pem_x509_crl(out.crl.crl_pem.encode())
    assert len(list(crl_obj)) == 1
    assert list(crl_obj)[0].serial_number == 987654321


def test_get_latest_crl_returns_newest(monkeypatch, ca_key_cert_pem):
    key_path, cert_path = ca_key_cert_pem
    monkeypatch.setenv("KEY_PATH_CA", str(key_path))
    monkeypatch.setenv("CERT_PATH_CA", str(cert_path))

    repo = FakeCrlRepository()
    svc = CrlService(repo=repo)
    svc.generate_crl()
    first_id = repo.crls[0]["id"]

    svc.generate_crl()
    latest = svc.get_latest_crl()
    assert latest is not None
    assert str(latest.id) != str(first_id)


def test_get_latest_crl_none_when_empty():
    repo = FakeCrlRepository()
    svc = CrlService(repo=repo)
    assert svc.get_latest_crl() is None
