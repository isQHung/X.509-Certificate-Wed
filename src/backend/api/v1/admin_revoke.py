from flask import Blueprint, jsonify
from core.services.revocation_service import RevocationService
from api.jwt_utils import get_user_id_from_payload

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
        actor_id = get_user_id_from_payload()
        result = RevocationService.approve_revocation(serial_number, actor_id=actor_id)
        
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
        actor_id = get_user_id_from_payload()
        result = RevocationService.reject_revocation(serial_number, actor_id=actor_id)
        
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


@revoke_bp.route("/direct/<serial_number>", methods=["POST"])
def revoke_certificate_direct(serial_number):
    """
    API Thu hồi trực tiếp chứng chỉ (Admin only)
    """
    try:
        actor_id = get_user_id_from_payload()
        RevocationService.revoke_certificate_by_serial(serial_number, actor_id=actor_id)
        
        return jsonify({
            "success": True,
            "message": f"Chứng chỉ Serial {serial_number} đã được thu hồi trực tiếp thành công."
        }), 200
        
    except ValueError as ve:
        return jsonify({
            "success": False,
            "message": str(ve)
        }), 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống khi thu hồi trực tiếp: {str(e)}"
        }), 500