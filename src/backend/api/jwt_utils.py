from flask import  request, jsonify
import jwt
import os
SECRET_KEY = os.getenv("JWT_SECRET_KEY")

def get_payload_from_token(token):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_role_from_payload():
    req_user = getattr(request, "user", None)
    if isinstance(req_user, dict):
        role = req_user.get("role")
        if role:
            return role

    token = request.cookies.get("session_token")
    payload = get_payload_from_token(token)
    return payload.get("role") if payload else None

def get_user_id_from_payload():
    req_user = getattr(request, "user", None)
    if isinstance(req_user, dict):
        user_id = req_user.get("userId") or req_user.get("user_id") or req_user.get("sub")
        if user_id:
            return user_id

    token = request.cookies.get("session_token")
    payload = get_payload_from_token(token)
    if not payload:
        return None
    return payload.get("userId") or payload.get("user_id") or payload.get("sub")

