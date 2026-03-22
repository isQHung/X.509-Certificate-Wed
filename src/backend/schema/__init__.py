# ============================================
# BACKEND SCHEMA PACKAGE
# ============================================

from .database_schema import (
    # Enums
    UserStatus,
    CertificateRequestStatus,
    CertificateStatus,

    # Base Models
    User,
    UserCreate,
    UserUpdate,
    Role,
    UserRole,
    CertificateRequest,
    CertificateRequestCreate,
    CertificateRequestUpdate,
    Certificate,
    CertificateCreate,
    CertificateUpdate,
    Revocation,
    RevocationCreate,
    CRL,
    CRLCreate,
    CRLEntry,
    CRLEntryCreate,
    AuditLog,
    AuditLogCreate,
    KeyPair,
    KeyPairCreate,

    # Relationship Models
    UserWithRoles,
    CertificateWithDetails,
    CertificateRequestWithDetails,

    # API Models
    LoginRequest,
    TokenResponse,
    ApproveCertificateRequest,
    RevokeCertificateRequest,

    # Pagination & Filtering
    PaginationParams,
    CertificateFilters,
    AuditLogFilters,
    PaginatedResponse,

    # Utility Functions
    create_audit_log_entry,
)

__all__ = [
    # Enums
    "UserStatus",
    "CertificateRequestStatus",
    "CertificateStatus",

    # Base Models
    "User",
    "UserCreate",
    "UserUpdate",
    "Role",
    "UserRole",
    "CertificateRequest",
    "CertificateRequestCreate",
    "CertificateRequestUpdate",
    "Certificate",
    "CertificateCreate",
    "CertificateUpdate",
    "Revocation",
    "RevocationCreate",
    "CRL",
    "CRLCreate",
    "CRLEntry",
    "CRLEntryCreate",
    "AuditLog",
    "AuditLogCreate",
    "KeyPair",
    "KeyPairCreate",

    # Relationship Models
    "UserWithRoles",
    "CertificateWithDetails",
    "CertificateRequestWithDetails",

    # API Models
    "LoginRequest",
    "TokenResponse",
    "ApproveCertificateRequest",
    "RevokeCertificateRequest",

    # Pagination & Filtering
    "PaginationParams",
    "CertificateFilters",
    "AuditLogFilters",
    "PaginatedResponse",

    # Utility Functions
    "create_audit_log_entry",
]