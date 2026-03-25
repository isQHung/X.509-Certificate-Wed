import datetime 
from core.models.mock_db import certificates_db, pending_revocation_requests, crl_table

class RevocationService:

    @staticmethod
    def get_pending_requests():
        return list(pending_revocation_requests.values())
    
    @staticmethod
    def approve_request(serial: str) -> dict:
        if serial not in pending_revocation_requests:
            raise ValueError(f"Khong tim thay yeu cau thu hoi voi serial: {serial}")
        cert = certificates_db.get(serial)
        if not cert:
            raise ValueError(f"Chung chi {serial} khong ton tai")
        
        if cert["status"]=="REVOKED":
            raise ValueError(f"Chung chi {serial} da bi thi hoi tu truoc")
        
        reason = pending_revocation_requests[serial]["reason"]

        cert["status"]="REVOKED"

        crl_record = {
            "serial": serial,
            "revocation_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "reason": reason
        }
        crl_table.append(crl_record)
        del pending_revocation_requests[serial]
        return {"serial": serial, "status": "REVOKED", "reason": reason}