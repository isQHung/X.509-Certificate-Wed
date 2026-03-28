from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from enum import Enum

class CertificateRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ISSUED = "issued"    
    
    
# ============================================
# Response schemas for API endpoints 
# ============================================
class ApproveCSRResponse(BaseModel):
    message: str
    serial: str
    
class CSRItemResponse(BaseModel):
    id: UUID
    user_id: UUID
    subject: Optional[dict]
    san: Optional[dict]
    status: CertificateRequestStatus
    created_at: datetime
    
class ListPendingCSRResponse(BaseModel):
    pending_requests: List[CSRItemResponse]

