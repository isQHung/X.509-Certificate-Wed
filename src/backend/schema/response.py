from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from schema.database_schema import CRL

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


class GenerateCrlResponse(BaseModel):
    crl: CRL
    revocations_moved: int


# ============================================
# Certificate Inspector Response Schemas
# ============================================
class CertificateValidityResponse(BaseModel):
    not_before: str = Field(..., description="Certificate valid from (ISO format)")
    not_after: str = Field(..., description="Certificate valid until (ISO format)")
    is_valid: bool = Field(..., description="Whether certificate is currently valid")


class CertificateExtensionResponse(BaseModel):
    name: str = Field(..., description="Extension name")
    critical: bool = Field(..., description="Whether extension is critical")
    value: Any = Field(..., description="Extension value")


class CertificateCaValidationResponse(BaseModel):
    issued_by_system_ca: bool = Field(..., description="Whether certificate issuer matches configured system CA")
    check_status: str = Field(..., description="Validation status: ok or unavailable")
    message: str = Field(..., description="Human-readable validation result")


class CertificateInspectResponse(BaseModel):
    serial: str = Field(..., description="Certificate serial number")
    subject: Dict[str, str] = Field(..., description="Certificate subject distinguished name")
    issuer: Dict[str, str] = Field(..., description="Certificate issuer distinguished name")
    validity: CertificateValidityResponse = Field(..., description="Certificate validity period")
    extensions: List[CertificateExtensionResponse] = Field(..., description="Certificate extensions")
    public_key_type: str = Field(..., description="Public key algorithm type")
    ca_validation: CertificateCaValidationResponse = Field(..., description="Certificate issuer validation against system CA")

