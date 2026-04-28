from flask import Blueprint, request, jsonify
from core.services.approve import approve_csr,reject_csr,list_pending_csr
from schema.response import ApproveCSRResponse
from api.jwt_utils import get_user_id_from_payload

admin_bp = Blueprint("admin", __name__, url_prefix="/v1")

@admin_bp.route("/approve/<uuid:id>/approve", methods=["POST"])
def approve(id):

    try:
        actor_id = get_user_id_from_payload()
        result = approve_csr(id, actor_id=actor_id)
        response = ApproveCSRResponse(message="CSR approved successfully", serial=result)
        return jsonify(response.model_dump()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
     
@admin_bp.route("/approve/<uuid:id>/reject", methods=["POST"])
def reject(id):

    try:
        actor_id = get_user_id_from_payload()
        result = reject_csr(id, actor_id=actor_id)
        return jsonify({"message": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@admin_bp.route("/approve/list", methods=["GET"])

def list_pending():
    try:
        result = list_pending_csr()
        return jsonify([item.model_dump() for item in result]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400