"""
CSR Generator API endpoints
Handles generating new RSA private key and Certificate Signing Request (CSR)
"""

from flask import Blueprint, request, jsonify
from core.services.csr_generator import generate_csr

csr_generator_bp = Blueprint("csr_generator", __name__, url_prefix="/v1")

@csr_generator_bp.route("/csr/generate", methods=["POST"])
def generate_csr_endpoint():
    """
    Generate a new CSR and Private Key
    
    Accepts JSON body:
    - subject: Dict containing at least 'CN' (Common Name). Optional: O, OU, C, ST, L
    - san: List of strings or comma-separated string for Subject Alternative Names (DNS)
    - user_id: ID of the user requesting the CSR (optional)
    
    Returns JSON:
    - request_id: Database ID of the created CSR request
    - csr_pem: The generated CSR in PEM format
    - private_key_pem: The generated Private Key in PEM format
    """
    try:
        # Check if request has JSON payload
        if not request.is_json:
            return jsonify({"error": "Request must be JSON format"}), 400
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Empty request body"}), 400
            
        # Call the core service to generate CSR and Key
        result = generate_csr(data)
        
        # Return the response
        return jsonify(result), 200
        
    except ValueError as e:
        # Catch validation errors (e.g., missing CN)
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # Catch system/crypto errors
        return jsonify({"error": f"Failed to generate CSR: {str(e)}"}), 500