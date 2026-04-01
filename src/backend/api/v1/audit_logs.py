from __future__ import annotations

from datetime import datetime
from uuid import UUID

from flask import Blueprint, jsonify, request

from core.services.audit_logs import AuditLogService
from schema.database_schema import AuditLogFilters


audit_logs_bp = Blueprint("audit_logs", __name__, url_prefix="/v1/audit_logs")

_SORT_ALLOWLIST = {"id", "created_at", "action", "target_type", "target_id", "actor_id"}


def _parse_iso_datetime(value: str) -> datetime:
    v = value.strip()
    if v.endswith("Z"):
        v = v[:-1] + "+00:00"
    return datetime.fromisoformat(v)


@audit_logs_bp.route("/", methods=["GET"])
def list_audit_logs():
    try:
        args = request.args

        page = int(args.get("page", 1))
        limit = int(args.get("limit", 10))
        if page < 1:
            raise ValueError("page must be >= 1")
        if limit < 1 or limit > 100:
            raise ValueError("limit must be between 1 and 100")

        sort_by = args.get("sort_by", "created_at")
        if sort_by not in _SORT_ALLOWLIST:
            raise ValueError(f"sort_by must be one of: {', '.join(sorted(_SORT_ALLOWLIST))}")

        sort_order = args.get("sort_order", "desc")
        if sort_order not in {"asc", "desc"}:
            raise ValueError("sort_order must be 'asc' or 'desc'")

        actor_id = args.get("actor_id")
        action = args.get("action")
        target_type = args.get("target_type")
        target_id = args.get("target_id")

        date_from = args.get("date_from")
        date_to = args.get("date_to")

        filters = AuditLogFilters(
            page=page,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order,
            actor_id=UUID(actor_id) if actor_id else None,
            action=action,
            target_type=target_type,
            target_id=target_id,
            date_from=_parse_iso_datetime(date_from) if date_from else None,
            date_to=_parse_iso_datetime(date_to) if date_to else None,
        )

        result = AuditLogService().list_audit_logs(filters)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

