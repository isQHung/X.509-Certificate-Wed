from flask import request, jsonify
import jwt
import os
SECRET_KEY = os.getenv("SECRET_KEY")

def jwt_middleware():
    # bỏ qua preflight (CORS)
    if request.method == "OPTIONS":
        return

    # chỉ check /api/v1/*
    if not request.path.startswith("/api/v1"):
        return

    token = request.cookies.get("access_token")

    if not token:
        return jsonify({"message": "Missing token"}), 401

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        request.user = payload  
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401