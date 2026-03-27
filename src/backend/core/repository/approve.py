from datetime import datetime, timezone
from db.supabase_client import get_supabase_client


supabase = get_supabase_client()

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