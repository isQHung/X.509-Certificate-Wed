from flask import Flask, request, jsonify
import os
from datetime import datetime
from api.routes import routes
from flask_cors import CORS
app = Flask(__name__)
CORS(app,supports_credentials=True,origins=["http://localhost:3000"]) 
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
