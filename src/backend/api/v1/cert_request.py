from flask import Blueprint, request, jsonify
from core.services.cert_request import create_csr,cancel_csr

customer_bp = Blueprint("customer", __name__, url_prefix="/v1")

@customer_bp.route("/cert_request", methods=["POST"])
def create_cert_request():
    try:
        data = request.get_json()
        result = create_csr(data)
        return jsonify({"message": "CSR created successfully", "request_id": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@customer_bp.route("/cert_request/<uuid:req_id>/cancel", methods=["POST"])
def cancel_cert_request(req_id):
    try:
        res = cancel_csr(req_id)
        return jsonify({"message": "CSR cancelled successfully", "request_id": res}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        