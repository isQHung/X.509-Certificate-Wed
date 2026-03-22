"""
Test case for user database write and read operations using Supabase
"""

import pytest_asyncio
import pytest
import os
from uuid import uuid4
from datetime import datetime
from supabase import create_client, Client
from typing import Dict, Any

from schema.database_schema import UserCreate, User, UserStatus

# Supabase configuration from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

# Validate configuration
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")


@pytest_asyncio.fixture
def supabase_client() -> Client:
    """Create Supabase client for testing"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)


@pytest_asyncio.fixture
async def mock_user():
    """Generate a mock user"""
    return {
        "id": str(uuid4()),
        "email": f"test_{uuid4().hex[:8]}@example.com",
        "password": "securepassword123",
        "password_hash": "hashed_securepassword123",  # simulate hash
        "status": "active",
        "created_at": datetime.now().isoformat(),
    }

@pytest.mark.asyncio
async def test_db_write_and_read_user(supabase_client: Client, mock_user):
    # Step 1: Insert user into DB
    insert_payload = {
        "id": mock_user["id"],
        "email": mock_user["email"],
        "password_hash": mock_user["password_hash"],
        "status": mock_user["status"],
        "created_at": mock_user["created_at"],
    }

    insert_response = supabase_client.table("users").insert(insert_payload).execute()

    assert insert_response.data is not None, "Insert failed"
    assert len(insert_response.data) == 1, "No row inserted"

    # Step 2: Read user back
    read_response = (
        supabase_client
        .table("users")
        .select("*")
        .eq("id", mock_user["id"])
        .single()
        .execute()
    )

    assert read_response.data is not None, "Read failed"

    db_user = read_response.data

    # Step 3: Compare fields
    assert db_user["id"] == mock_user["id"]
    assert db_user["email"] == mock_user["email"]
    assert db_user["password_hash"] == mock_user["password_hash"]
    assert db_user["status"] == mock_user["status"]

    # Optional: check timestamp presence (not strict equality due to formatting differences)
    assert "created_at" in db_user
    assert db_user["created_at"] is not None

    # Step 4: Cleanup (important for repeatable tests)
    delete_response = (
        supabase_client
        .table("users")
        .delete()
        .eq("id", mock_user["id"])
        .execute()
    )

    assert delete_response.data is not None, "Cleanup failed"