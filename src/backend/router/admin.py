from flask import Blueprint, jsonify
from service.csr_service import approve_csr, reject_csr, list_pending_csr

# Gom chung topic lại thành "csr"
admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin/csr")

@admin_bp.route("/pending", methods=["GET"])
def list_pending():
    try:
        data = list_pending_csr()
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/<uuid:id>/approve", methods=["POST"])
def approve(id):
    try:
        result = approve_csr(str(id))
        return jsonify({"status": "success", "data": result})
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        print(f"LỖI TẠI ĐÂY NÈ: {str(e)}") # In ra terminal
        return jsonify({"error": str(e)}), 500 # Trả thẳng ra CMD

@admin_bp.route("/<uuid:id>/reject", methods=["POST"])
def reject(id):
    try:
        result = reject_csr(str(id))
        return jsonify({"status": "success", "data": result})
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500