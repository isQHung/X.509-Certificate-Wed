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
    token = request.cookies.get("session_token")
    payload = get_payload_from_token(token)
    return payload.get("role") if payload else None

def get_user_id_from_payload():
    token = request.cookies.get("session_token")
    payload = get_payload_from_token(token)
    return payload.get("userId") if payload else None