import unittest
import jwt
from flask import Flask, jsonify, request
from api.middleware import jwt_middleware, SECRET_KEY # Import từ file của bạn

class TestAuthMiddleware(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.client = self.app.test_client()

        @self.app.before_request
        def middleware():
            return jwt_middleware()

        @self.app.route('/api/v1/test', methods=['GET'])
        def test_route():
            return jsonify({"data": "success"}), 200

    # Test Case 1: Thành công với Token hợp lệ
    def test_valid_token(self):
        payload = {"user_id": 1, "username": "admin", "role": "ADMIN"}
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        
        # Gửi request kèm cookie
        self.client.set_cookie(
            key='session_token',
            value=token
        )
        response = self.client.get('/api/v1/test')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"success", response.data)

    # Test Case 2: Thất bại khi thiếu Token (401)
    def test_missing_token(self):
        response = self.client.get('/api/v1/test')
        self.assertEqual(response.status_code, 401)
        self.assertIn(b"Missing token", response.data)

    # Test Case 3: Thất bại với Token giả mạo/sai Secret (401/403)
    def test_invalid_token(self):
        token = "fake.token.value"
        self.client.set_cookie(
            key='session_token',
            value=token
        )
        response = self.client.get('/api/v1/test')
        self.assertEqual(response.status_code, 401)
        self.assertIn(b"Invalid token", response.data)

if __name__ == '__main__':
    unittest.main()