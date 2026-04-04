from flask import Blueprint, request, jsonify, make_response
from core.services.auth.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    result = AuthService.login(username, password)

    if not result["success"]:
        return jsonify(result), 401

    response = make_response(jsonify({"message": "Login success"}))

    #  set HTTPOnly cookie
    response.set_cookie(
        "access_token",
        result["access_token"],
        httponly=True,
        secure=False,  # dev
        samesite="Lax",
        max_age=3600
    )

    response.set_cookie(
        "refresh_token",
        result["refresh_token"],
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=604800
    )

    return response

@auth_bp.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"message": "Logout success"}))

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

    return response