from core.repository.certificates import CertificateListRepository
from db.supabase_client import get_supabase_client
from schema.database_schema import Certificate, CertificateWithDetails, Revocation
from typing import List, Optional
from uuid import UUID
import json

supabase = get_supabase_client()
repo = CertificateListRepository(supabase)


def _normalize_json_fields(record: dict) -> dict:
    """Normalize fields typed as Pydantic Json to JSON strings."""
    normalized = dict(record)
    for field in ("subject", "san"):
        value = normalized.get(field)
        if isinstance(value, (dict, list)):
            normalized[field] = json.dumps(value)
    return normalized


def _convert_to_certificate(record: dict) -> Certificate:
    """Convert database record to Certificate Pydantic model"""
    if not record:
        return None

    cleaned_record = _normalize_json_fields(record)

    # Remove nested relationships for base Certificate model
    cleaned_record.pop("certificate_requests", None)
    cleaned_record.pop("revocations", None)

    return Certificate(**cleaned_record)


def _convert_to_certificate_with_details(record: dict) -> CertificateWithDetails:
    """Convert database record to CertificateWithDetails Pydantic model"""
    if not record:
        return None

    cleaned_record = _normalize_json_fields(record)

    # Extract and clean nested data
    certificate_requests = cleaned_record.pop("certificate_requests", None)
    revocation_data = cleaned_record.pop("revocations", [])

    # Convert revocations to Revocation models
    revocations = [Revocation(**rev) for rev in revocation_data] if revocation_data else []

    return CertificateWithDetails(
        **cleaned_record,
        request=certificate_requests,
        revocations=revocations
    )


def list_my_certificates(user_id: UUID, status: Optional[str] = None) -> List[dict]:
    """Fetch user's certificates and return as list of validated Certificate models"""
    if not user_id:
        raise ValueError("Missing user_id")

    records = repo.list_by_user(user_id=user_id, status=status)
    
    # Convert records to Pydantic models
    certificates = [_convert_to_certificate(record) for record in records]
    
    # Return as serializable dictionaries
    return [cert.model_dump() for cert in certificates]


def list_all_certificates(status: Optional[str] = None) -> List[dict]:
    """Fetch all certificates and return as list of validated Certificate models"""
    records = repo.list_all(status=status)
    
    # Convert records to Pydantic models
    certificates = [_convert_to_certificate(record) for record in records]
    
    # Return as serializable dictionaries
    return [cert.model_dump() for cert in certificates]


def get_certificate_details(cert_id: UUID, include_revocations: bool = False) -> dict:
    """Fetch detailed certificate information with optional revocations"""
    if not cert_id:
        raise ValueError("Missing cert_id")
    
    # This would require adding a method to repository to fetch by ID
    # For now, returning a placeholder that can be extended
    pass