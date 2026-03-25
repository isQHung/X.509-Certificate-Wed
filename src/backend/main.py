from flask import Flask, request, jsonify
import os
from datetime import datetime
from api.routers.admin_revoke import revoke_bp
app = Flask(__name__)
app.register_blueprint(revoke_bp)
# Health check endpoint
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "message": os.getenv("ENV_VAR"),
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
