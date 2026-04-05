from flask import Blueprint,request, jsonify
from .v1.system_config import system_config_bp
from .v1.user_revoke import user_revoke_bp
from .v1.admin_revoke import revoke_bp
from .v1.approve import admin_bp
from .v1.cert_request import customer_bp
from .v1.crl import crl_bp
from .v1.audit_logs import audit_logs_bp
from .middleware import jwt_middleware
from .v1.certificate_inspector import certificate_bp
from .v1.csr_generator import csr_generator_bp

routes = Blueprint('routes', __name__, url_prefix='/api')

ADMIN_ONLY_BLUEPRINTS = [
    'admin',         
    'admin_revoke',        
    'system_config',  
    'audit_logs',
    'crl'      
]

@routes.before_request
def middleware():
    # Bước 1: Xác thực Token (Authentication)
    auth_error = jwt_middleware()
    if auth_error:
        return auth_error

    # Bước 2: Lấy thông tin user vừa được jwt_middleware gán vào
    user = getattr(request, 'user', None)
    
    # Nếu API không yêu cầu token (ví dụ các route public) thì user sẽ là None
    if not user:
        return None

    # Bước 3: Phân quyền (Authorization)
    user_role = user.get('role')
    
    current_bp = request.blueprint

    if current_bp in ADMIN_ONLY_BLUEPRINTS and user_role != 'admin':
        return jsonify({
            "message": "Forbidden: Bạn không có quyền Admin để thực hiện thao tác này!"
        }), 403

    return None

routes.register_blueprint(system_config_bp)
routes.register_blueprint(admin_bp)
routes.register_blueprint(revoke_bp)
routes.register_blueprint(user_revoke_bp)
routes.register_blueprint(customer_bp)
routes.register_blueprint(certificate_bp)
routes.register_blueprint(crl_bp)
routes.register_blueprint(audit_logs_bp)
