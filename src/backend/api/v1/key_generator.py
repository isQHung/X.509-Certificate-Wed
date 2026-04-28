"""
Key generation API endpoints.
Handles creating new customer key pairs without creating a CSR.
"""

from flask import Blueprint, request, jsonify

from api.jwt_utils import get_user_id_from_payload
from core.services.key_generator import generate_key_pair

key_generator_bp = Blueprint("key_generator", __name__, url_prefix="/v1")


@key_generator_bp.route("/keys/generate", methods=["POST"])
def generate_key_pair_endpoint():
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON format"}), 400

        data = request.get_json()
        if not data:
            return jsonify({"error": "Empty request body"}), 400

        user_id = get_user_id_from_payload() or data.get("userId") or data.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized: Missing User ID"}), 401

        result = generate_key_pair(data, user_id)
        return jsonify(result), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Failed to generate key pair: {str(exc)}"}), 500