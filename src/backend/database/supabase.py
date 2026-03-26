from supabase import create_client, Client
import os
from datetime import datetime, timezone

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def get_csr_by_id(req_id):
    res = supabase.table("certificate_requests").select("*").eq("id", req_id).execute()
    data = res.data
    if not data:
        return None
    return data[0]

def save_certificate(cert_data):    
    supabase.table("certificates").insert(cert_data).execute()
    
def update_csr_status(csr_req):
    supabase.table("certificate_requests").update({"status": csr_req["status"]}).eq("id", csr_req["id"]).execute()
    
def update_csr_time(csr_req):
    supabase.table("certificate_requests").update({"approved_at": datetime.now(timezone.utc).isoformat()}).eq("id", csr_req["id"]).execute()
    
def get_csr(status):
    res = supabase.table("certificate_requests").select("*").eq("status", status).execute()
    return res.data