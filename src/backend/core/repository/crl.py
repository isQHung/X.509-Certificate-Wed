from __future__ import annotations

from typing import Any, List, Optional
from uuid import UUID

from schema.database_schema import CRL, CRLEntry, CRLUpdate, CRLEntryUpdate


class CrlRepository:
    def __init__(self, supabase_client):
        self.db = supabase_client
        self.revocations_table = "revocations"
        self.crl_table = "crl"
        self.crl_entries_table = "crl_entries"

    def list_revocations(self) -> List[dict[str, Any]]:
        res = self.db.table(self.revocations_table).select("*").execute()
        return res.data or []

    def delete_revocation_by_id(self, revocation_id: str | UUID) -> bool:
        rid = str(revocation_id)
        res = self.db.table(self.revocations_table).delete().eq("id", rid).execute()
        return bool(res.data)

    def delete_revocations_by_ids(self, revocation_ids: List[str | UUID]) -> None:
        if not revocation_ids:
            return
        ids = [str(i) for i in revocation_ids]
        self.db.table(self.revocations_table).delete().in_("id", ids).execute()

    def insert_crl_entry(self, entry: dict[str, Any]) -> CRLEntry:
        res = self.db.table(self.crl_entries_table).insert(entry).execute()
        if not res.data:
            raise RuntimeError("Insert crl_entries returned no data")
        return CRLEntry.model_validate(res.data[0])

    def update_crl_entry(
        self, entry_id: str | UUID, data: CRLEntryUpdate
    ) -> Optional[CRLEntry]:
        payload = data.model_dump(exclude_none=True, mode="json")
        if not payload:
            row = self._get_crl_entry_row(entry_id)
            return CRLEntry.model_validate(row) if row else None
        res = (
            self.db.table(self.crl_entries_table)
            .update(payload)
            .eq("id", str(entry_id))
            .execute()
        )
        if not res.data:
            return None
        return CRLEntry.model_validate(res.data[0])

    def delete_crl_entry_by_id(self, entry_id: str | UUID) -> bool:
        res = self.db.table(self.crl_entries_table).delete().eq("id", str(entry_id)).execute()
        return bool(res.data)

    def insert_crl_entries_many(self, entries: List[dict[str, Any]]) -> List[dict[str, Any]]:
        if not entries:
            return []
        res = self.db.table(self.crl_entries_table).insert(entries).execute()
        return res.data or []

    def list_all_crl_entries(self) -> List[dict[str, Any]]:
        res = self.db.table(self.crl_entries_table).select("*").execute()
        return res.data or []

    def insert_crl(self, crl_row: dict[str, Any]) -> CRL:
        res = self.db.table(self.crl_table).insert(crl_row).execute()
        if not res.data:
            raise RuntimeError("Insert crl returned no data")
        return CRL.model_validate(res.data[0])

    def update_crl(self, crl_id: str | UUID, data: CRLUpdate) -> Optional[CRL]:
        payload = data.model_dump(exclude_none=True, mode="json")
        if not payload:
            row = self._get_crl_row(crl_id)
            return CRL.model_validate(row) if row else None
        res = (
            self.db.table(self.crl_table)
            .update(payload)
            .eq("id", str(crl_id))
            .execute()
        )
        if not res.data:
            return None
        return CRL.model_validate(res.data[0])

    def get_latest_crl(self) -> Optional[CRL]:
        res = (
            self.db.table(self.crl_table)
            .select("*")
            .order("generated_at", desc=True)
            .limit(1)
            .execute()
        )
        if not res.data:
            return None
        return CRL.model_validate(res.data[0])

    def delete_crl(self, crl_id: str | UUID) -> bool:
        res = self.db.table(self.crl_table).delete().eq("id", str(crl_id)).execute()
        return bool(res.data)

    def _get_crl_row(self, crl_id: str | UUID) -> Optional[dict[str, Any]]:
        res = (
            self.db.table(self.crl_table)
            .select("*")
            .eq("id", str(crl_id))
            .limit(1)
            .execute()
        )
        if not res.data:
            return None
        return res.data[0]

    def _get_crl_entry_row(self, entry_id: str | UUID) -> Optional[dict[str, Any]]:
        res = (
            self.db.table(self.crl_entries_table)
            .select("*")
            .eq("id", str(entry_id))
            .limit(1)
            .execute()
        )
        if not res.data:
            return None
        return res.data[0]
