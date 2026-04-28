"""
Certificate Inspector API endpoints
Handles certificate file uploads and inspection
"""

from flask import Blueprint, request, jsonify
from core.services.certificate_inspector import CertificateInspector
from schema.response import CertificateInspectResponse

certificate_bp = Blueprint("certificate_inspector", __name__, url_prefix="/v1")

# Allowed file extensions
ALLOWED_EXTENSIONS = {'crt', 'pem', 'cer', 'der'}
MAX_FILE_SIZE = 1024 * 1024  # 1MB max file size


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@certificate_bp.route("/certificate/inspect", methods=["POST"])
def inspect_certificate():
    """
    Inspect certificate file and extract information
    
    Accepts:
    - Form-data with 'certificate' file field
    - Supported formats: .crt, .pem, .cer, .der
    
    Returns:
    - JSON with parsed certificate information including:
      - serial: Certificate serial number (hex string)
      - subject: Subject DN (dict)
      - issuer: Issuer DN (dict)
      - validity: Not before/after timestamps and validity status
      - extensions: List of certificate extensions
      - public_key_type: Algorithm type (RSA, ECDSA, etc.)
    """
    try:
        # Check if file is in request
        if 'certificate' not in request.files:
            return jsonify({"error": "No certificate file provided"}), 400
        
        file = request.files['certificate']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                "error": f"Invalid file type. Accepted types: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Check file size
        file_content = file.read()
        if len(file_content) > MAX_FILE_SIZE:
            return jsonify({"error": "File size exceeds maximum allowed (1MB)"}), 400
        
        # Inspect certificate
        inspector = CertificateInspector(file_content)
        cert_info = inspector.inspect()
        
        # Validate response structure
        response = CertificateInspectResponse(**cert_info)
        
        return jsonify(response.model_dump()), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to process certificate: {str(e)}"}), 500
