from flask import Blueprint, request, jsonify
from core.services.approve import approve_csr,reject_csr,list_pending_csr
from schema.response import ApproveCSRResponse

admin_bp = Blueprint("admin", __name__, url_prefix="/v1")

@admin_bp.route("/approve/<uuid:id>/approve", methods=["POST"])
def approve(id):

    try:
        result = approve_csr(id)
        response = ApproveCSRResponse(message="CSR approved successfully", serial=result)
        return jsonify(response.model_dump()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
     
@admin_bp.route("/approve/<uuid:id>/reject", methods=["POST"])
def reject(id):

    try:
        result = reject_csr(id)
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