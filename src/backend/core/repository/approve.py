from datetime import datetime, timezone


class CertificateRepository:
    def __init__(self, supabase_client):
        # Truyền client vào lúc khởi tạo, không gọi global nữa
        self.db = supabase_client 
        self.req_table = "certificate_requests"
        self.cert_table = "certificates"

    def get_csr_by_id(self, req_id):
        res = self.db.table(self.req_table).select("*").eq("id", req_id).execute()
        data = res.data
        if not data:
            return None
        return data[0]

    def save_certificate(self, cert_data):
        self.db.table(self.cert_table).insert(cert_data).execute()

    def update_csr_status(self, csr_req):
        self.db.table(self.req_table).update({"status": csr_req["status"]}).eq("id", csr_req["id"]).execute()

    def finalize_csr_decision(self, csr_req, approved_by=None):
        payload = {
            "status": csr_req["status"],
            "approved_at": datetime.now(timezone.utc).isoformat(),
            "approved_by": approved_by,
        }
        self.db.table(self.req_table).update(payload).eq("id", csr_req["id"]).execute()

    def get_csr(self, status):
        res = self.db.table(self.req_table).select("*").eq("status", status).execute()
        return res.data