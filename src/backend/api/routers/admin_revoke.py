from flask import Blueprint, jsonify
from core.services.revocation_service import RevocationService

revoke_bp = Blueprint('admin_revoke', __name__, url_prefix='/api/v1/admin/revoke')

@revoke_bp.route("/list", methods=["POST"])
def get_revocation_list():
    try:
        data = RevocationService.get_pending_requests()
        return jsonify({
            "status": "success",
            "total_pending": len(data),
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@revoke_bp.route("/<serial>", methods=["POST"])
def approve_revocation(serial):
    try:
        result = RevocationService.approve_request(serial)
        return jsonify({
            "status": "success",
            "message": f"Đã thu hồi thành công chứng chỉ {serial}",
            "data": result
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Lỗi server: {str(e)}"}), 500