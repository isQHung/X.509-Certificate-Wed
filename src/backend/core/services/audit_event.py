from __future__ import annotations

from typing import Any, Optional
from uuid import UUID

from db.supabase_client import get_supabase_client

supabase = get_supabase_client()


def normalize_user_id(user_id: Optional[str]) -> Optional[str]:
    if not user_id:
        return None
    try:
        return str(UUID(str(user_id)))
    except (ValueError, TypeError):
        return None


def record_audit_event(
    action: str,
    actor_id: Optional[str] = None,
    *,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> None:
    payload = {
        "actor_id": normalize_user_id(actor_id),
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "metadata": metadata or None,
    }

    try:
        supabase.table("audit_logs").insert(payload).execute()
    except Exception as exc:
        print(f"[audit] action '{action}' failed: {exc}")
