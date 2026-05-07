from flask import Blueprint, request, jsonify
from core.services.cert_request import create_csr, cancel_csr, get_list_csr_by_user_id
from core.services.csr_generator import generate_csr
from api.jwt_utils import get_user_id_from_payload
customer_bp = Blueprint("customer", __name__, url_prefix="/v1")

@customer_bp.route("/cert_request", methods=["POST"])
def create_cert_request():
    try:
        data = request.get_json()
        if not isinstance(data, dict):
            return jsonify({"error": "Invalid JSON payload"}), 400

        user_id = get_user_id_from_payload()
        if not user_id:
            return jsonify({"error": "Unauthorized: Missing User ID"}), 401

        # Backward compatibility: accept direct csr_pem submissions.
        if data.get("csr_pem"):
            data["user_id"] = data.get("user_id") or user_id
            result = create_csr(data, actor_id=user_id)
            return jsonify({"message": "CSR created successfully", "request_id": result}), 200

        result = generate_csr(data, user_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@customer_bp.route("/cert_request/<uuid:req_id>/cancel", methods=["POST"])
def cancel_cert_request(req_id):
    try:
        user_id = get_user_id_from_payload()
        res = cancel_csr(req_id, actor_id=user_id)
        return jsonify({"message": "CSR cancelled successfully", "request_id": res}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@customer_bp.route("/cert_request/list", methods=["GET"])
def list_cert_request():
    try:
        user_id = get_user_id_from_payload()
        res = get_list_csr_by_user_id(user_id=user_id)
        return jsonify({"message": "CSR cancelled successfully", "list_csr": res}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500