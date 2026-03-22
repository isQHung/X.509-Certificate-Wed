# ============================================
# USAGE EXAMPLES - Backend Python
# ============================================

from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

from .database_schema import (
    User,
    UserCreate,
    Certificate,
    CertificateCreate,
    CertificateRequest,
    CertificateRequestCreate,
    CertificateRequestStatus,
    CertificateStatus,
    AuditLogCreate,
    create_audit_log_entry,
    PaginatedResponse,
    CertificateFilters
)


# Example: Creating a new user
def create_user(email: str, password: str) -> UserCreate:
    """Create a new user with validation"""
    return UserCreate(
        email=email,
        password=password,
        status="active"
    )


# Example: Creating a certificate from request
def create_certificate_from_request(
    request: CertificateRequest,
    issuer_cert: Optional[Certificate] = None,
    validity_days: int = 365
) -> CertificateCreate:
    """Create certificate from approved request"""

    # Calculate validity period
    now = datetime.utcnow()
    valid_to = now + timedelta(days=validity_days)

    return CertificateCreate(
        serial_number=f"cert_{uuid4().hex[:16].upper()}",
        issuer_id=issuer_cert.id if issuer_cert else None,
        subject=request.subject,
        san=request.san,
        public_key="extracted_from_csr",  # Would extract from CSR
        valid_from=now,
        valid_to=valid_to,
        status=CertificateStatus.ACTIVE,
        certificate_pem="generated_certificate_pem",  # Would be generated
        csr_id=request.id
    )


# Example: Audit logging for certificate operations
def log_certificate_operation(
    action: str,
    certificate: Certificate,
    actor_id: Optional[str] = None
) -> AuditLogCreate:
    """Create audit log entry for certificate operations"""

    return create_audit_log_entry(
        action=action,
        actor_id=actor_id,
        target_type="certificate",
        target_id=certificate.serial_number,
        metadata={
            "certificate_id": str(certificate.id),
            "status": certificate.status,
            "issuer_id": str(certificate.issuer_id) if certificate.issuer_id else None
        }
    )


# Example: Certificate validation
def validate_certificate(cert: Certificate) -> bool:
    """Validate certificate status and expiration"""
    if cert.status != CertificateStatus.ACTIVE:
        return False

    if cert.valid_to and cert.valid_to < datetime.utcnow():
        return False

    return True


# Example: Paginated response helper
def create_paginated_response(
    items: List,
    total: int,
    page: int,
    limit: int
) -> PaginatedResponse:
    """Create paginated response with calculated metadata"""
    return PaginatedResponse(
        data=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )


# Example: Certificate filtering
def filter_certificates(
    certificates: List[Certificate],
    filters: CertificateFilters
) -> List[Certificate]:
    """Apply filters to certificate list"""

    filtered = certificates

    if filters.status:
        filtered = [c for c in filtered if c.status == filters.status]

    if filters.user_id:
        # Would need to join with certificate_requests to filter by user
        # This is just an example
        pass

    if filters.serial_number:
        filtered = [c for c in filtered if filters.serial_number in c.serial_number]

    # Apply pagination
    start = (filters.page - 1) * filters.limit
    end = start + filters.limit
    return filtered[start:end]


# Example: API endpoint handler (pseudo-code)
class CertificateService:
    def __init__(self, db_session):
        self.db = db_session

    async def create_certificate_request(
        self,
        user_id: str,
        request_data: CertificateRequestCreate
    ) -> CertificateRequest:
        """Create a new certificate request"""

        # Create request
        request = CertificateRequest(
            id=uuid4(),
            user_id=user_id,
            **request_data.dict(),
            status=CertificateRequestStatus.PENDING,
            created_at=datetime.utcnow()
        )

        # Save to database
        self.db.add(request)
        await self.db.commit()

        # Create audit log
        audit_log = log_certificate_operation(
            action="CERTIFICATE_REQUEST_CREATED",
            certificate=None,  # No certificate yet
            actor_id=user_id
        )

        return request

    async def approve_certificate_request(
        self,
        request_id: str,
        approver_id: str,
        approved: bool,
        reason: Optional[str] = None
    ) -> CertificateRequest:
        """Approve or reject certificate request"""

        # Get request
        request = await self.db.get(CertificateRequest, request_id)
        if not request:
            raise ValueError("Certificate request not found")

        # Update status
        request.status = (
            CertificateRequestStatus.APPROVED
            if approved
            else CertificateRequestStatus.REJECTED
        )
        request.approved_by = approver_id
        request.approved_at = datetime.utcnow()

        # If approved, create certificate
        if approved:
            certificate = create_certificate_from_request(request)
            self.db.add(certificate)

            # Log certificate creation
            audit_log = log_certificate_operation(
                action="CERTIFICATE_CREATED",
                certificate=certificate,
                actor_id=approver_id
            )
            self.db.add(audit_log)

        await self.db.commit()
        return request


# Example: FastAPI route (pseudo-code)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()
certificate_service = CertificateService()

@router.post("/certificates/requests", response_model=CertificateRequest)
async def create_certificate_request(
    request: CertificateRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = CertificateService(db)
    return await service.create_certificate_request(
        user_id=str(current_user.id),
        request_data=request
    )

@router.post("/certificates/requests/{request_id}/approve")
async def approve_certificate_request(
    request_id: str,
    approval: ApproveCertificateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = CertificateService(db)
    return await service.approve_certificate_request(
        request_id=request_id,
        approver_id=str(current_user.id),
        approved=approval.approved,
        reason=approval.reason
    )
"""