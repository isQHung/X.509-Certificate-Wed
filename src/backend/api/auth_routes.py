from flask import Blueprint
from .auth.auth_routes import auth_bp

auth_routes = Blueprint('auth_routes', __name__, url_prefix='/api')

auth_routes.register_blueprint(auth_bp)