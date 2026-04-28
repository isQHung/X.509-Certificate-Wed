from flask import Blueprint, request, jsonify
import os
from cryptography import x509
from cryptography.hazmat.primitives import hashes
from core.crypto.RSA import RSACAService
from api.jwt_utils import get_user_id_from_payload
from core.services.audit_event import record_audit_event

root_ca_bp = Blueprint('root_ca', __name__, url_prefix='/v1')

@root_ca_bp.route("/root_ca/certificate", methods=["GET"])
def get_root_certificate():
    """Lấy thông tin Root CA"""
    rsa_service = RSACAService()
    key_path = os.getenv("KEY_PATH_CA", "ca_key.pem")
    cert_path = os.getenv("CERT_PATH_CA", "ca_cert.pem")
    
    if not os.path.exists(cert_path) or not os.path.exists(key_path):
        return jsonify({"success": False, "message": "Root CA not initialized"}), 404
        
    try:
        _, cert_bytes = rsa_service.load_root_ca_credentials(key_path, cert_path)
        cert = x509.load_pem_x509_certificate(cert_bytes)
        
        # safely parse subject elements mapping NAME oid to string
        subject_dict = {}
        for attr in cert.subject:
            try:
                subject_dict[attr.oid._name] = attr.value
            except:
                pass
                
        return jsonify({
            "success": True,
            "pem": cert_bytes.decode('utf-8'),
            "subject": subject_dict,
            "serial_number": str(cert.serial_number),
            "valid_from": cert.not_valid_before_utc.isoformat(),
            "valid_to": cert.not_valid_after_utc.isoformat(),
            "hash_algorithm": cert.signature_hash_algorithm.name if cert.signature_hash_algorithm else "UNKNOWN",
            "key_size": cert.public_key().key_size
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@root_ca_bp.route("/admin/root/revoke", methods=["POST"])
def revoke_root_ca():
    """Thu hồi Root CA bằng cách xoá files"""
    actor_id = get_user_id_from_payload()
    key_path = os.getenv("KEY_PATH_CA", "ca_key.pem")
    cert_path = os.getenv("CERT_PATH_CA", "ca_cert.pem")
    
    deleted = False
    if os.path.exists(key_path):
        os.remove(key_path)
        deleted = True
    if os.path.exists(cert_path):
        os.remove(cert_path)
        deleted = True
        
    if deleted:
        record_audit_event(
            "ROOT_CA_REVOKED",
            actor_id,
            target_type="root_ca",
            target_id="system",
            metadata={"key_path": key_path, "cert_path": cert_path},
        )
        return jsonify({"success": True, "message": "Root CA has been revoked."}), 200
    else:
        record_audit_event(
            "ROOT_CA_REVOKE_NOT_FOUND",
            actor_id,
            target_type="root_ca",
            target_id="system",
            metadata={"key_path": key_path, "cert_path": cert_path},
        )
        return jsonify({"success": False, "message": "Root CA not found."}), 404

@root_ca_bp.route("/admin/root/generate", methods=["POST"])
def generate_root_ca():
    """Tự động sinh Root CA dựa trên thông tin file .env"""
    actor_id = get_user_id_from_payload()
    rsa_service = RSACAService()
    key_path = os.getenv("KEY_PATH_CA", "ca_key.pem")
    cert_path = os.getenv("CERT_PATH_CA", "ca_cert.pem")
    
    if os.path.exists(cert_path) and os.path.exists(key_path):
        record_audit_event(
            "ROOT_CA_CREATE_SKIPPED_EXISTS",
            actor_id,
            target_type="root_ca",
            target_id="system",
            metadata={"key_path": key_path, "cert_path": cert_path},
        )
        return jsonify({"success": False, "message": "Root CA already exists."}), 400
        
    try:
        org_name = os.getenv("CA_ORG_NAME", "Default System Root CA")
        common_name = os.getenv("CA_COMMON_NAME", org_name)
        
        priv_key, pub_key = rsa_service.generate_key_pair()
        cert = rsa_service.generate_root_ca(priv_key, pub_key, common_name)
        
        with open(key_path, "wb") as f:
            f.write(rsa_service.serialize_private_key(priv_key))
            
        with open(cert_path, "wb") as f:
            f.write(rsa_service.serialize_cert(cert))

        record_audit_event(
            "ROOT_CA_CREATED",
            actor_id,
            target_type="root_ca",
            target_id="system",
            metadata={
                "key_path": key_path,
                "cert_path": cert_path,
                "common_name": common_name,
                "serial_number": str(cert.serial_number),
            },
        )
            
        return jsonify({"success": True, "message": "Khởi tạo Root CA từ ENV thành công."}), 201
    except Exception as e:
        record_audit_event(
            "ROOT_CA_CREATE_FAILED",
            actor_id,
            target_type="root_ca",
            target_id="system",
            metadata={"error": str(e), "key_path": key_path, "cert_path": cert_path},
        )
        return jsonify({"success": False, "message": str(e)}), 500
