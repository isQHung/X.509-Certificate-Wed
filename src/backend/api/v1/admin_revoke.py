from flask import Blueprint, jsonify
from core.services.revocation_service import RevocationService

# Khởi tạo Blueprint với prefix chuẩn
revoke_bp = Blueprint('admin_revoke', __name__, url_prefix='/v1/admin/revoke')

@revoke_bp.route("/list", methods=["GET"])
def list_pending_revocations():
    """
    API Lấy danh sách các chứng chỉ đang xin thu hồi (Pending)
    """
    try:
        data = RevocationService.get_pending_list()
        
        return jsonify([item.model_dump() for item in data]), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống khi lấy danh sách: {str(e)}"
        }), 500


@revoke_bp.route("/<serial_number>/approve", methods=["POST"])
def approve_revocation(serial_number):
    """
    API Phê duyệt yêu cầu thu hồi chứng chỉ
    """
    try:
        result = RevocationService.approve_revocation(serial_number)
        
        return jsonify(result), 200
        
    except ValueError as ve:
        return jsonify({
            "success": False,
            "message": str(ve)
        }), 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống khi phê duyệt: {str(e)}"
        }), 500


@revoke_bp.route("/<serial_number>/reject", methods=["POST"])
def reject_revocation(serial_number):
    """
    API Từ chối yêu cầu thu hồi chứng chỉ
    """
    try:
        result = RevocationService.reject_revocation(serial_number)
        
        return jsonify(result), 200
        
    except ValueError as ve:
        return jsonify({
            "success": False,
            "message": str(ve)
        }), 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống khi từ chối: {str(e)}"
        }), 500