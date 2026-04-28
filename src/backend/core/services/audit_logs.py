from __future__ import annotations

from math import ceil
from typing import Any

from db.supabase_client import get_supabase_client
from schema.database_schema import AuditLogFilters, PaginatedResponse


class AuditLogService:
    def __init__(self):
        self.supabase = get_supabase_client()
        self.table = "audit_logs"

    def list_audit_logs(self, filters: AuditLogFilters) -> dict[str, Any]:
        page = filters.page
        limit = filters.limit
        sort_by = filters.sort_by or "created_at"
        sort_order = filters.sort_order or "desc"

        from_idx = (page - 1) * limit
        to_idx = from_idx + limit - 1

        query = self.supabase.table(self.table).select("*", count="exact")

        if filters.actor_id is not None:
            query = query.eq("actor_id", str(filters.actor_id))
        if filters.action is not None:
            query = query.eq("action", filters.action)
        if filters.target_type is not None:
            query = query.eq("target_type", filters.target_type)
        if filters.target_id is not None:
            query = query.eq("target_id", filters.target_id)
        if filters.date_from is not None:
            query = query.gte("created_at", filters.date_from.isoformat())
        if filters.date_to is not None:
            query = query.lte("created_at", filters.date_to.isoformat())

        query = query.order(sort_by, desc=(sort_order == "desc")).range(from_idx, to_idx)

        res = query.execute()

        total = getattr(res, "count", None)
        if total is None:
            total = len(res.data or [])

        rows = res.data or []
        # Return raw rows from PostgREST to avoid strict model parsing issues
        # with JSONB fields and keep API response stable.
        data = []
        for row in rows:
            normalized = dict(row)
            actor_id = normalized.get("actor_id")
            if actor_id is not None:
                normalized["actor_id"] = str(actor_id)
            data.append(normalized)
        
        return PaginatedResponse(
            data=data,
            total=total,
            page=page,
            limit=limit,
            total_pages=ceil(total / limit) if limit else 0,
        ).model_dump(mode="json")

