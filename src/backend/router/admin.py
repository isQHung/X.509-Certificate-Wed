from flask import Blueprint, request, jsonify
from service.csr_service import approve_csr,reject_csr,list_pending_csr

admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin")

@admin_bp.route("/approve/<uuid:id>", methods=["POST"])
def approve(id):

    try:
        result = approve_csr(id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
     
@admin_bp.route("/reject/<uuid:id>", methods=["POST"])
def reject(id):

    try:
        result = reject_csr(id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@admin_bp.route("/approve/list", methods=["GET"])
def list_pending():
    try:
        result = list_pending_csr()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400