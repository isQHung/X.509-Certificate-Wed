"""
Certificate Inspector Service
Parses X.509 certificates and extracts relevant information
"""

from cryptography import x509
from cryptography.x509.oid import ExtensionOID, NameOID
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import json


class CertificateInspector:
    """Service to inspect and parse X.509 certificates"""
    
    def __init__(self, certificate_pem: bytes):
        """
        Initialize with certificate PEM data
        
        Args:
            certificate_pem: Certificate in PEM format (bytes)
            
        Raises:
            ValueError: If certificate PEM is invalid
        """
        try:
            if isinstance(certificate_pem, str):
                certificate_pem = certificate_pem.encode()
            self.certificate = x509.load_pem_x509_certificate(certificate_pem)
        except Exception as e:
            raise ValueError(f"Invalid certificate format: {e}")
    
    def extract_subject(self) -> Dict[str, str]:
        """Extract subject distinguished name"""
        subject_dict = {}
        for attr in self.certificate.subject:
            oid_name = attr.oid._name
            subject_dict[oid_name] = attr.value
        return subject_dict
    
    def extract_issuer(self) -> Dict[str, str]:
        """Extract issuer distinguished name"""
        issuer_dict = {}
        for attr in self.certificate.issuer:
            oid_name = attr.oid._name
            issuer_dict[oid_name] = attr.value
        return issuer_dict
    
    def extract_serial(self) -> str:
        """Extract serial number"""
        return str(self.certificate.serial_number)
    
    def extract_validity(self) -> Dict[str, Any]:
        """Extract certificate validity period"""
        now = datetime.now(timezone.utc)
        return {
            "not_before": self.certificate.not_valid_before_utc.isoformat(),
            "not_after": self.certificate.not_valid_after_utc.isoformat(),
            "is_valid": self.certificate.not_valid_before_utc <= now <= self.certificate.not_valid_after_utc
        }
    
    def extract_extensions(self) -> List[Dict[str, Any]]:
        """Extract certificate extensions"""
        extensions_list = []
        
        try:
            # Basic Constraints
            basic_constraints = self.certificate.extensions.get_extension_for_oid(
                ExtensionOID.BASIC_CONSTRAINTS
            )
            extensions_list.append({
                "name": "Basic Constraints",
                "critical": basic_constraints.critical,
                "value": {
                    "ca": basic_constraints.value.ca,
                    "path_length": basic_constraints.value.path_length
                }
            })
        except x509.ExtensionNotFound:
            pass
        
        try:
            # Key Usage
            key_usage = self.certificate.extensions.get_extension_for_oid(
                ExtensionOID.KEY_USAGE
            )
            extensions_list.append({
                "name": "Key Usage",
                "critical": key_usage.critical,
                "value": {
                    "digital_signature": key_usage.value.digital_signature,
                    "content_commitment": key_usage.value.content_commitment,
                    "key_encipherment": key_usage.value.key_encipherment,
                    "data_encipherment": key_usage.value.data_encipherment,
                    "key_agreement": key_usage.value.key_agreement,
                    "key_cert_sign": key_usage.value.key_cert_sign,
                    "crl_sign": key_usage.value.crl_sign,
                    "encipher_only": key_usage.value.encipher_only if key_usage.value.key_agreement else None,
                    "decipher_only": key_usage.value.decipher_only if key_usage.value.key_agreement else None
                }
            })
        except x509.ExtensionNotFound:
            pass
        
        try:
            # Subject Alternative Names
            san_ext = self.certificate.extensions.get_extension_for_oid(
                ExtensionOID.SUBJECT_ALTERNATIVE_NAME
            )
            san_values = []
            for general_name in san_ext.value:
                if isinstance(general_name, x509.DNSName):
                    san_values.append({"type": "DNS", "value": general_name.value})
                elif isinstance(general_name, x509.RFC822Name):
                    san_values.append({"type": "Email", "value": general_name.value})
                elif isinstance(general_name, x509.IPAddress):
                    san_values.append({"type": "IP", "value": str(general_name.value)})
                elif isinstance(general_name, x509.UniformResourceIdentifier):
                    san_values.append({"type": "URI", "value": general_name.value})
            
            extensions_list.append({
                "name": "Subject Alternative Names",
                "critical": san_ext.critical,
                "value": san_values
            })
        except x509.ExtensionNotFound:
            pass
        
        try:
            # Extended Key Usage
            extended_key_usage = self.certificate.extensions.get_extension_for_oid(
                ExtensionOID.EXTENDED_KEY_USAGE
            )
            eku_values = [str(oid._name) for oid in extended_key_usage.value]
            extensions_list.append({
                "name": "Extended Key Usage",
                "critical": extended_key_usage.critical,
                "value": eku_values
            })
        except x509.ExtensionNotFound:
            pass
        
        try:
            # Authority Key Identifier
            auth_key_id = self.certificate.extensions.get_extension_for_oid(
                ExtensionOID.AUTHORITY_KEY_IDENTIFIER
            )
            extensions_list.append({
                "name": "Authority Key Identifier",
                "critical": auth_key_id.critical,
                "value": {
                    "key_identifier": auth_key_id.value.key_identifier.hex() if auth_key_id.value.key_identifier else None
                }
            })
        except x509.ExtensionNotFound:
            pass
        
        try:
            # Subject Key Identifier
            subj_key_id = self.certificate.extensions.get_extension_for_oid(
                ExtensionOID.SUBJECT_KEY_IDENTIFIER
            )
            extensions_list.append({
                "name": "Subject Key Identifier",
                "critical": subj_key_id.critical,
                "value": {
                    "key_identifier": subj_key_id.value.digest.hex()
                }
            })
        except x509.ExtensionNotFound:
            pass
        
        try:
            # CRL Distribution Points
            crl_dist = self.certificate.extensions.get_extension_for_oid(
                ExtensionOID.CRL_DISTRIBUTION_POINTS
            )
            crl_values = []
            for dist_point in crl_dist.value:
                if dist_point.full_name:
                    for name in dist_point.full_name:
                        crl_values.append(str(name.value))
            extensions_list.append({
                "name": "CRL Distribution Points",
                "critical": crl_dist.critical,
                "value": crl_values
            })
        except x509.ExtensionNotFound:
            pass
        
        try:
            # Authority Information Access
            auth_info = self.certificate.extensions.get_extension_for_oid(
                ExtensionOID.AUTHORITY_INFORMATION_ACCESS
            )
            aia_values = []
            for desc in auth_info.value:
                aia_values.append({
                    "method": str(desc.access_method._name),
                    "location": str(desc.access_location.value)
                })
            extensions_list.append({
                "name": "Authority Information Access",
                "critical": auth_info.critical,
                "value": aia_values
            })
        except x509.ExtensionNotFound:
            pass
        
        return extensions_list
    
    def inspect(self) -> Dict[str, Any]:
        """
        Inspect certificate and extract all relevant information
        
        Returns:
            Dictionary containing all parsed certificate information
        """
        return {
            "serial": self.extract_serial(),
            "subject": self.extract_subject(),
            "issuer": self.extract_issuer(),
            "validity": self.extract_validity(),
            "extensions": self.extract_extensions(),
            "public_key_type": str(self.certificate.public_key().__class__.__name__)
        }
