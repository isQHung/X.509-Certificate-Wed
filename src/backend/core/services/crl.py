from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional
from uuid import uuid4

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization

from core.crypto.RSA import RSACAService
from core.repository.crl import CrlRepository
from db.supabase_client import get_supabase_client
from schema.database_schema import CRL, CRLCreate, CRLEntryCreate, Revocation
from schema.response import GenerateCrlResponse


def _parse_serial(serial: str) -> int:
    s = serial.strip()
    if s.lower().startswith("0x"):
        return int(s, 16)
    return int(s, 10)


def _parse_revoked_at(value: Any) -> datetime:
    if isinstance(value, datetime):
        dt = value
    elif isinstance(value, str):
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    else:
        raise ValueError(f"Unsupported revoked_at type: {type(value)}")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _dedupe_entries_by_serial(entries: List[dict[str, Any]]) -> List[dict[str, Any]]:
    best: dict[str, dict[str, Any]] = {}
    for row in entries:
        sn = row.get("serial_number")
        if not sn:
            continue
        try:
            ts = _parse_revoked_at(row.get("revoked_at"))
        except (ValueError, TypeError):
            continue
        key = str(sn)
        prev = best.get(key)
        if prev is None or ts > _parse_revoked_at(prev.get("revoked_at")):
            best[key] = row
    return list(best.values())


def _build_crl_pem(
    ca_cert: x509.Certificate,
    ca_private_key: Any,
    entry_rows: List[dict[str, Any]],
    *,
    next_update_days: int,
) -> str:
    now = datetime.now(timezone.utc)
    next_up = now + timedelta(days=next_update_days)

    builder = (
        x509.CertificateRevocationListBuilder()
        .issuer_name(ca_cert.issuer)
        .last_update(now)
        .next_update(next_up)
    )

    for row in entry_rows:
        sn = row.get("serial_number")
        if sn is None:
            continue
        revoked_at = _parse_revoked_at(row.get("revoked_at"))
        serial_int = _parse_serial(str(sn))
        revoked = (
            x509.RevokedCertificateBuilder()
            .serial_number(serial_int)
            .revocation_date(revoked_at)
            .build()
        )
        builder = builder.add_revoked_certificate(revoked)

    crl = builder.sign(private_key=ca_private_key, algorithm=hashes.SHA256())
    return crl.public_bytes(serialization.Encoding.PEM).decode()


class CrlService:
    def __init__(self, repo: CrlRepository | None = None):
        self._repo = repo or CrlRepository(get_supabase_client())
        self._rsa = RSACAService()

    def generate_crl(self) -> GenerateCrlResponse:
        key_path = os.getenv("KEY_PATH_CA")
        cert_path = os.getenv("CERT_PATH_CA")
        if not key_path or not cert_path:
            raise ValueError("KEY_PATH_CA và CERT_PATH_CA phải được cấu hình")

        next_days = int(os.getenv("CRL_NEXT_UPDATE_DAYS", "1"))

        ca_key_pem, ca_cert_pem = self._rsa.load_root_ca_credentials(key_path, cert_path)
        ca_private_key = serialization.load_pem_private_key(ca_key_pem, password=None)
        ca_cert = x509.load_pem_x509_certificate(ca_cert_pem)

        pending_raw = self._repo.list_revocations()
        pending = [Revocation.model_validate(row) for row in pending_raw]
        new_crl_id = uuid4()

        if pending:
            to_insert: List[dict[str, Any]] = []
            revocation_ids: List[str] = []
            for rev in pending:
                revocation_ids.append(str(rev.id))
                entry = CRLEntryCreate(
                    crl_id=new_crl_id,
                    serial_number=rev.serial_number,
                    revoked_at=rev.revoked_at,
                    reason=rev.reason,
                )
                to_insert.append(
                    {"id": str(uuid4()), **entry.model_dump(mode="json")}
                )
            self._repo.insert_crl_entries_many(to_insert)
            self._repo.delete_revocations_by_ids(revocation_ids)

        all_entries = _dedupe_entries_by_serial(self._repo.list_all_crl_entries())
        crl_pem = _build_crl_pem(
            ca_cert,
            ca_private_key,
            all_entries,
            next_update_days=next_days,
        )

        now = datetime.now(timezone.utc)
        next_up = now + timedelta(days=next_days)
        crl_create = CRLCreate(
            version=1,
            generated_at=now,
            next_update=next_up,
            crl_pem=crl_pem,
        )
        crl_row = {"id": str(new_crl_id), **crl_create.model_dump(mode="json")}
        crl_saved = self._repo.insert_crl(crl_row)

        return GenerateCrlResponse(crl=crl_saved, revocations_moved=len(pending))

    def get_latest_crl(self) -> Optional[CRL]:
        return self._repo.get_latest_crl()
