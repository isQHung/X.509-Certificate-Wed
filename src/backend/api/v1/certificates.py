from flask import Blueprint, request, jsonify
from uuid import UUID

from core.services.certificates import list_my_certificates, list_all_certificates, import_external_certificate_service
from api.jwt_utils import get_role_from_payload, get_user_id_from_payload
from core.services.certificate_inspector import CertificateInspector

certificates_bp = Blueprint("certificates", __name__, url_prefix="/v1/certificates")


@certificates_bp.route("/my", methods=["GET"])
def get_my_certificates():
    """Get certificates for the authenticated user"""
    try:
        user_id = get_user_id_from_payload()
        if not user_id:
            return jsonify({"error": "Unauthorized: Missing user identity in token"}), 401

        # Validate and convert user_id to UUID
        try:
            user_uuid = UUID(str(user_id))
        except ValueError:
            return jsonify({"error": "Invalid user ID format"}), 400

        status = request.args.get("status", None)
        
        # Fetch certificates with validated schema
        certificates = list_my_certificates(user_id=user_uuid, status=status)
        
        return jsonify({
            "success": True,
            "data": certificates,
            "count": len(certificates)
        }), 200
    
    except ValueError as ve:
        return jsonify({"error": f"Validation error: {str(ve)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@certificates_bp.route("/all", methods=["GET"])
def get_all_certificates():
    """Get all certificates (admin only)"""
    try:
        # role = get_role_from_payload()
        # if not role or str(role).lower() != "admin":
        #     return jsonify({"error": "Forbidden: Admin role required"}), 403

        status = request.args.get("status", None)
        
        # Fetch all certificates with validated schema
        certificates = list_all_certificates(status=status)
        
        return jsonify({
            "success": True,
            "data": certificates,
            "count": len(certificates)
        }), 200
    
    except ValueError as ve:
        print (str(ve))
        return jsonify({"error": f"Validation error: {str(ve)}"}), 400
    except Exception as e:
        print (str(e))
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@certificates_bp.route("/import", methods=["POST"])
def import_certificate():
    """Import an external certificate"""
    try:
        user_id = get_user_id_from_payload()
        if not user_id:
            return jsonify({"error": "Unauthorized: Missing user identity"}), 401
            
        try:
            user_uuid = UUID(str(user_id))
        except ValueError:
            return jsonify({"error": "Invalid user ID format"}), 400
        
        if 'certificate' not in request.files:
            return jsonify({"error": "No certificate file provided"}), 400
            
        file = request.files['certificate']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        file_content = file.read()
        if len(file_content) > 1024 * 1024:
            return jsonify({"error": "File size exceeds maximum allowed (1MB)"}), 400
            
        # Inspect the certificate
        try:
            inspector = CertificateInspector(file_content)
            cert_info = inspector.inspect()
        except Exception as e:
            return jsonify({"error": f"Failed to parse certificate: {str(e)}"}), 400
        
        pem_str = file_content.decode('utf-8') if isinstance(file_content, bytes) else file_content
        
        # Save to DB
        imported_cert = import_external_certificate_service(
            user_id=user_uuid,
            cert_data=cert_info,
            pem_content=pem_str
        )
        
        return jsonify({
            "success": True,
            "data": imported_cert
        }), 200
        
    except ValueError as ve:
        return jsonify({"error": f"Validation error: {str(ve)}"}), 400
    except Exception as e:
        print(str(e))
        return jsonify({"error": f"Server error: {str(e)}"}), 500