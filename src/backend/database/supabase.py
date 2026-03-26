import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Thiếu cấu hình SUPABASE_URL hoặc SUPABASE_ANON_KEY trong biến môi trường")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)