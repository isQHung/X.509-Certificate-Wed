from __future__ import annotations

from typing import Optional
from uuid import UUID


def normalize_user_id(user_id: Optional[str]) -> Optional[str]:
    if not user_id:
        return None
    try:
        return str(UUID(str(user_id)))
    except (ValueError, TypeError):
        return None
