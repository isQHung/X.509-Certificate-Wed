from flask import Flask, request, jsonify
import os
from datetime import datetime
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv(dotenv_path=Path(__file__).parent / ".env")
except Exception:
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v

from api.routes import routes

app = Flask(__name__)
# Enable CORS for API endpoints. Prefer flask-cors when installed,
# otherwise add permissive CORS headers as a fallback.
try:
    from flask_cors import CORS

    # Allow requests from frontend during development and support credentials
    allowed_origin = os.getenv("CORS_ALLOW_ORIGIN", "http://localhost:3000")
    CORS(app, resources={r"/api/*": {"origins": allowed_origin}}, supports_credentials=True)
except Exception:
    @app.after_request
    def _add_cors_headers(response):
        origin = os.getenv("CORS_ALLOW_ORIGIN", "http://localhost:3000")
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    @app.before_request
    def _handle_options():
        from flask import make_response

        if request.method == "OPTIONS":
            resp = make_response("")
            origin = os.getenv("CORS_ALLOW_ORIGIN", "http://localhost:3000")
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
            resp.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
            resp.headers["Access-Control-Allow-Credentials"] = "true"
            return resp
app.register_blueprint(routes)

# Health check endpoint
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }), 200

# Error handler
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500


def main():
    # Development server
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=True
    )


if __name__ == "__main__":
    main()