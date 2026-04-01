from __future__ import annotations

import os
from typing import Optional

from supabase import Client, create_client

_supabase: Optional[Client] = None


def get_supabase_client() -> Client:
    global _supabase
    if _supabase is not None:
        return _supabase

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url:
        raise ValueError("SUPABASE_URL is required")
    if not key:
        raise ValueError("SUPABASE_ANON_KEY is required")

    _supabase = create_client(url, key)
    return _supabase