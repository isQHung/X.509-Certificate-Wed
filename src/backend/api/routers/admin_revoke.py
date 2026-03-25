from fastapi import APIRouter, HTTPException
from core.services.revocation_service import RevocationService

router=APIRouter(prefix="/api/v1/admin/revoke", tags=["Admin Revoke"])

@router.post("/list")
def get_revocation_list():
    try:
        pending_list= RevocationService.get_pending_requests()
        return{
            "status":"success",
            "total_pending": len(pending_list),
            "data": pending_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Loi he thong khi lay danh sach")
    
@router.post("/{serial}")
def approve_revocation(serial:str):
    try:
        result= RevocationService.approve_request(serial)

        return {
            "status":"success",
            "message":f"Da thu hoi chung chi {serial}",
            "data": result
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))