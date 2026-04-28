from flask import Blueprint, request, jsonify
from core.services.rec_rq_service import RevocationRequestService
from api.jwt_utils import get_user_id_from_payload

user_revoke_bp = Blueprint('user_revoke', __name__, url_prefix='/v1/user/revoke')

@user_revoke_bp.route("/<serial_number>/request", methods=["POST"])
def submit_revoke_request(serial_number):
    """
    API Khách hàng yêu cầu thu hồi chứng chỉ
    Đường dẫn: POST /api/v1/user/revoke/{serial_number}/request
    Body JSON: {"reason": "Lost Private Key"}
    """
    try:
        data = request.get_json()
        
        if not data or not data.get("reason"):
            return jsonify({
                "success": False,
                "message": "Bắt buộc phải có lý do (reason) trong body request."
            }), 400

        reason = data.get("reason")

        requested_by = get_user_id_from_payload()

        RevocationRequestService.create_revocation_request(
            serial_number=serial_number, 
            reason=reason,
            requested_by=requested_by
        )
        
        return jsonify({
            "success": True,
            "message": f"Da gui yeu cau thu hoi cho chung chi {serial_number} thanh cong. Vui long cho Admin duyet."
        }), 201
        
    except ValueError as ve:
        return jsonify({
            "success": False,
            "message": str(ve)
        }), 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500
@user_revoke_bp.route("/<serial_number>/cancel", methods=["POST"])
def cancel_revoke_request(serial_number):
    """
    API Khách hàng hủy yêu cầu thu hồi chứng chỉ (khi đơn còn đang pending)
    Đường dẫn: POST /api/v1/user/revoke/{serial_number}/cancel
    """
    try:
        requested_by = get_user_id_from_payload()

        RevocationRequestService.cancel_revocation_request(
            serial_number=serial_number,
            requested_by=requested_by
        )
        
        return jsonify({
            "success": True,
            "message": f"Da huy yeu cau thu hoi cho chung chi {serial_number} thanh cong."
        }), 200
        
    except ValueError as ve:
        return jsonify({
            "success": False,
            "message": str(ve)
        }), 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500