from flask import Blueprint
from .v1.system_config import system_config_bp
from .v1.approve import admin_bp
from .v1.cert_request import customer_bp

routes = Blueprint('routes', __name__, url_prefix='/api')

routes.register_blueprint(system_config_bp)
routes.register_blueprint(admin_bp)
routes.register_blueprint(customer_bp)