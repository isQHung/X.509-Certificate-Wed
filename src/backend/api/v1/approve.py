from flask import Blueprint, request, jsonify
from core.services.approve import approve_csr,reject_csr,list_pending_csr
from schema.database_schema import ListPendingCSRResponse,RejectCSRResponse,ApproveCSRResponse

admin_bp = Blueprint("admin", __name__, url_prefix="/v1")

@admin_bp.route("/approve/<uuid:id>", methods=["POST"])
def approve(id):

    try:
        result = approve_csr(id)
        response = ApproveCSRResponse(message="CSR approved successfully", serial=result)
        return jsonify(response.model_dump())
    except Exception as e:
        return jsonify({"error": str(e)}), 400
     
@admin_bp.route("/reject/<uuid:id>", methods=["POST"])

def reject(id):

    try:
        result = reject_csr(id)
        response = RejectCSRResponse(message=result)
        return jsonify(response.model_dump())
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@admin_bp.route("/approve/list", methods=["GET"])

def list_pending():
    try:
        result = list_pending_csr()
        response = ListPendingCSRResponse(pending_requests=result)
        return jsonify(response.model_dump())
    except Exception as e:
        return jsonify({"error": str(e)}), 400