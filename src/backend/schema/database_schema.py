# ============================================
# PYTHON BACKEND SCHEMAS
# Using Pydantic for data validation and serialization
# ============================================

from datetime import datetime
from typing import Optional, List, Any, Dict
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from pydantic.types import Json


# ============================================
# COMMON ENUMS
# ============================================

class UserStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"


class CertificateRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ISSUED = "issued"


class CertificateStatus(str, Enum):
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"


# ============================================
# USER MANAGEMENT MODELS
# ============================================

class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    status: UserStatus = Field(default=UserStatus.ACTIVE, description="User account status")

    class ConfigDict:
        use_enum_values = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Plain text password")


class UserUpdate(BaseModel):
    email: Optional[str] = None
    status: Optional[UserStatus] = None


class User(UserBase):
    id: UUID
    password_hash: str = Field(..., exclude=True)  # Never expose password hash
    created_at: datetime

    class ConfigDict:
        from_attributes = True


class Role(BaseModel):
    id: int
    name: str = Field(..., description="Role name (admin, user, etc.)")

    class ConfigDict:
        from_attributes = True


class UserRole(BaseModel):
    user_id: UUID
    role_id: int

    class ConfigDict:
        from_attributes = True


# ============================================
# CERTIFICATE MANAGEMENT MODELS
# ============================================

class CertificateRequestBase(BaseModel):
    csr_pem: str = Field(..., description="Certificate Signing Request in PEM format")
    subject: Optional[Json] = Field(default=None, description="Certificate subject as JSON")
    san: Optional[Json] = Field(default=None, description="Subject Alternative Names as JSON")


class CertificateRequestCreate(CertificateRequestBase):
    pass


class CertificateRequestUpdate(BaseModel):
    status: Optional[CertificateRequestStatus] = None
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None


class CertificateRequest(CertificateRequestBase):
    id: UUID
    user_id: UUID
    status: CertificateRequestStatus = Field(default=CertificateRequestStatus.PENDING)
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

    class ConfigDict:
        from_attributes = True


class CertificateBase(BaseModel):
    serial_number: str = Field(..., description="Unique certificate serial number")
    issuer_id: Optional[UUID] = Field(default=None, description="Issuer certificate ID (null for root CA)")
    subject: Optional[Json] = Field(default=None, description="Certificate subject as JSON")
    san: Optional[Json] = Field(default=None, description="Subject Alternative Names as JSON")
    public_key: str = Field(..., description="Public key in PEM format")
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    status: CertificateStatus = Field(default=CertificateStatus.ACTIVE)
    certificate_pem: str = Field(..., description="Certificate in PEM format")
    csr_id: Optional[UUID] = None


class CertificateCreate(CertificateBase):
    pass


class CertificateUpdate(BaseModel):
    status: Optional[CertificateStatus] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None


class Certificate(CertificateBase):
    id: UUID
    created_at: datetime

    class ConfigDict:
        from_attributes = True


# ============================================
# REVOCATION & CRL MODELS
# ============================================

class RevocationBase(BaseModel):
    certificate_id: UUID
    serial_number: str
    reason: Optional[str] = None


class RevocationCreate(RevocationBase):
    pass


class Revocation(RevocationBase):
    id: UUID
    revoked_at: datetime

    class ConfigDict:
        from_attributes = True


class CRLBase(BaseModel):
    version: int = Field(default=1, description="CRL version number")
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    next_update: Optional[datetime] = None
    crl_pem: str = Field(..., description="Certificate Revocation List in PEM format")


class CRLCreate(CRLBase):
    pass


class CRL(CRLBase):
    id: UUID

    class ConfigDict:
        from_attributes = True


class CRLEntryBase(BaseModel):
    crl_id: UUID
    serial_number: str
    revoked_at: datetime
    reason: Optional[str] = None


class CRLEntryCreate(CRLEntryBase):
    pass


class CRLEntry(CRLEntryBase):
    id: UUID

    class ConfigDict:
        from_attributes = True


# ============================================
# AUDIT LOG MODEL
# ============================================

class AuditLogBase(BaseModel):
    actor_id: Optional[UUID] = None
    action: str = Field(..., description="Action performed (CREATE, UPDATE, DELETE, etc.)")
    target_type: Optional[str] = Field(default=None, description="Type of target entity")
    target_id: Optional[str] = Field(default=None, description="ID of target entity")
    metadata: Optional[Json] = Field(default=None, description="Additional metadata as JSON")


class AuditLogCreate(AuditLogBase):
    pass


class AuditLog(AuditLogBase):
    id: int
    created_at: datetime

    class ConfigDict:
        from_attributes = True


# ============================================
# KEY PAIR MODEL
# ============================================

class KeyPairBase(BaseModel):
    owner_id: UUID
    key_type: str = Field(..., description="Key algorithm (RSA, ECDSA, etc.)")
    key_size: int = Field(..., description="Key size in bits")
    fingerprint: str = Field(..., description="Key fingerprint/hash")


class KeyPairCreate(KeyPairBase):
    pass


class KeyPair(KeyPairBase):
    id: UUID
    created_at: datetime

    class ConfigDict:
        from_attributes = True


# ============================================
# RELATIONSHIP MODELS (for API responses)
# ============================================

class UserWithRoles(User):
    roles: List[Role] = []


class CertificateWithDetails(Certificate):
    issuer: Optional[Certificate] = None
    request: Optional[CertificateRequest] = None
    revocations: List[Revocation] = []


class CertificateRequestWithDetails(CertificateRequest):
    user: User
    approver: Optional[User] = None
    certificate: Optional[Certificate] = None

# ============================================
# SYSTEM CONFIGURATION MODELS
# ============================================

class SystemConfigBase(BaseModel):
    name: Optional[str] = Field(default=None, description="Name of the system configuration")
    key_algorithm: Optional[str] = Field(default=None, description="Key algorithm (RSA, ECDSA, etc.)")
    key_size: Optional[int] = Field(default=None, description="Key size in bits")
    signature_algorithm: Optional[str] = Field(default=None, description="Signature algorithm (SHA256, SHA384, SHA512, etc.)")
    hash_algorithm: Optional[str] = Field(default=None, description="Hash algorithm (SHA256, SHA384, SHA512, etc.)")
    default_validity_days: Optional[int] = Field(default=None, description="Default validity days")

class SystemConfigCreate(SystemConfigBase):
    pass

class SystemConfigResponse(SystemConfigBase):
    id: Optional[UUID] = Field(default=None, description="ID of the system configuration")

    class ConfigDict:
        from_attributes = True

# ============================================
# API REQUEST/RESPONSE MODELS
# ============================================

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User


class ApproveCertificateRequest(BaseModel):
    approved: bool
    reason: Optional[str] = None


class RevokeCertificateRequest(BaseModel):
    reason: Optional[str] = None


# ============================================
# PAGINATION & FILTERING
# ============================================

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)
    sort_by: Optional[str] = None
    sort_order: Optional[str] = Field(default="desc", pattern="^(asc|desc)$")


class CertificateFilters(PaginationParams):
    status: Optional[CertificateStatus] = None
    user_id: Optional[UUID] = None
    serial_number: Optional[str] = None


class AuditLogFilters(PaginationParams):
    actor_id: Optional[UUID] = None
    action: Optional[str] = None
    target_type: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class PaginatedResponse(BaseModel):
    data: List[Any]
    total: int
    page: int
    limit: int
    total_pages: int

    @field_validator('total_pages')
    def calculate_total_pages(cls, v, values):
        if 'total' in values and 'limit' in values:
            return (values['total'] + values['limit'] - 1) // values['limit']
        return v


# ============================================
# UTILITY FUNCTIONS
# ============================================

def create_audit_log_entry(
    action: str,
    actor_id: Optional[UUID] = None,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> AuditLogCreate:
    """Helper function to create audit log entries"""
    return AuditLogCreate(
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        metadata=metadata
    )