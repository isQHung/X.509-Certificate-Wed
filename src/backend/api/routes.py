from flask import Blueprint
from .v1.system_config import system_config_bp
from .v1.user_revoke import user_revoke_bp
from .v1.admin_revoke import revoke_bp
from .v1.approve import admin_bp
from .v1.cert_request import customer_bp
from .v1.crl import crl_bp
from .v1.audit_logs import audit_logs_bp
from .v1.certificate_inspector import certificate_bp

routes = Blueprint('routes', __name__, url_prefix='/api')

routes.register_blueprint(system_config_bp)
routes.register_blueprint(admin_bp)
routes.register_blueprint(revoke_bp)
routes.register_blueprint(user_revoke_bp)
routes.register_blueprint(customer_bp)
routes.register_blueprint(certificate_bp)
routes.register_blueprint(crl_bp)
routes.register_blueprint(audit_logs_bp)
