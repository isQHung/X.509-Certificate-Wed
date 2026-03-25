import os
from dotenv import load_dotenv
from supabase import create_client, Client

from pathlib import Path
env_path = Path(__file__).parent.parent / '.env.example'
load_dotenv(dotenv_path=env_path)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError(f"Thiếu URL hoặc KEY! Đang tìm file .env tại: {env_path}")

supabase: Client = create_client(url, key)