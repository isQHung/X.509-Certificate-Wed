import pytest
import jwt
from datetime import datetime, timedelta, timezone
from flask import Flask, jsonify, request
from functools import wraps
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="jwt")

# --- 1. SETUP MÔI TRƯỜNG TEST ---
SESSION_SECRET = "QNTgNiGccIsYWwwgFNpWHQpnG70kfPvzgS9n+kMV27wXDWxaUCRa/wmLJolU+BM572mnWO9NdOmK5bnFwCgdCw=="
COOKIE_NAME = "session_token"

app = Flask(__name__)
app.config['TESTING'] = True

# Middleware cần test
def session_cookie_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get(COOKIE_NAME)
        
        if not token:
            # Chưa login -> 401
            return jsonify({'error': 'Unauthorized'}), 401
            
        try:
            payload = jwt.decode(token, SESSION_SECRET, algorithms=["HS256"])
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            # Cookie giả mạo -> 403
            return jsonify({'error': 'Forbidden'}), 403
            
        return f(*args, **kwargs)
    return decorated

# API Route dùng để test
@app.route('/api/v1/dashboard', methods=['GET'])
@session_cookie_required
def dashboard():
    return jsonify({"message": "Success", "user": request.user}), 200

# Fixture tạo test client của Flask
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

# Hàm hỗ trợ tạo token hợp lệ
def create_valid_token():
    payload = {
        "sub": "user-123",
        "role": "ADMIN",
        # Dùng datetime timezone-aware UTC
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    return jwt.encode(payload, SESSION_SECRET, algorithm="HS256")

# --- 2. CÁC TEST CASE ---

def test_success_flow(client):
    token = create_valid_token()
    client.set_cookie(
        key=COOKIE_NAME,
        value=token,
        domain='localhost'  # optional
    )
    response = client.get('/api/v1/dashboard')
    assert response.status_code == 200
    assert response.json['message'] == "Success"
    assert response.json['user']['sub'] == "user-123"
    
def test_fail_unauthorized_flow(client):
    """
    [Chưa login]: Gọi API không có Cookie.
    Expected: 401 Unauthorized.
    """
    response = client.get('/api/v1/dashboard')
    
    assert response.status_code == 401
    assert response.json['error'] == 'Unauthorized'

def test_fail_forged_cookie_flow(client):
    fake_secret = "hacker-secret-key"
    fake_payload = {"sub": "hacker-999", "role": "ADMIN"}
    forged_token = jwt.encode(fake_payload, fake_secret, algorithm="HS256")

    client.set_cookie(
        key=COOKIE_NAME,
        value=forged_token,
        domain='localhost'
    )
    response = client.get('/api/v1/dashboard')
    assert response.status_code == 403
    assert response.json['error'] == 'Forbidden'