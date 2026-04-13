"""Key pair generation service for customer-owned key material."""

from typing import Any, Dict

from db.supabase_client import get_supabase_client

from core.services.key_material import (
    generate_private_key,
    resolve_key_options,
    serialize_private_key,
    serialize_public_key,
)

supabase = get_supabase_client()


def generate_key_pair(data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    if not user_id:
        raise PermissionError("User ID is required")

    alias = str(data.get("alias", "")).strip()
    if not alias:
        raise ValueError("Alias is required")

    key_algorithm, key_size = resolve_key_options(data)
    private_key = generate_private_key(key_algorithm, key_size)
    public_key = private_key.public_key()

    private_key_pem = serialize_private_key(private_key)
    public_key_pem = serialize_public_key(public_key)

    key_pair_payload = {
        "owner_id": user_id,
        "alias": alias,
        "key_type": key_algorithm,
        "key_size": key_size,
        "fingerprint": public_key_pem,
    }

    try:
        db_res = supabase.table("key_pairs").insert(key_pair_payload).execute()
        key_pair_id = db_res.data[0]["id"] if db_res.data else None
    except Exception as exc:
        raise RuntimeError(f"Database Error (key_pairs): {exc}") from exc

    return {
        "key_pair_id": key_pair_id,
        "private_key_pem": private_key_pem,
        "public_key_pem": public_key_pem,
        "alias": alias,
        "key_algorithm": key_algorithm,
        "key_size": key_size,
    }