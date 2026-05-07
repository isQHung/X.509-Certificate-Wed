

class CertificateRequestRepository:
    def __init__(self, supabase_client):
        self.db = supabase_client 
        self.req_table = "certificate_requests"
        self.cert_table = "certificates"
        
    def get_csr_by_id(self, req_id):
        res = self.db.table(self.req_table).select("*").eq("id", req_id).execute()
        data = res.data
        if not data:
            return None
        return data[0]
    
    def get_csr_by_user_id(self, user_id):
        res = self.db.table(self.req_table).select("*").eq("user_id", user_id).limit(5).execute()
        data = res.data
        if not data:
            return None
        return data
    
    def insert_csr(self, csr_req):
        res = self.db.table(self.req_table).insert(csr_req).execute()
        return res.data[0]['id']
    
    def delete_csr(self, req_id):
        self.db.table(self.req_table).delete().eq("id", req_id).execute()