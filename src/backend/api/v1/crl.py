from flask import Blueprint, jsonify

from core.services.crl import CrlService

crl_bp = Blueprint("crl", __name__, url_prefix="/v1")


@crl_bp.route("/crl", methods=["GET"])
def generate_crl():
    try:
        result = CrlService().generate_crl()
        return jsonify(result.model_dump(mode="json")), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@crl_bp.route("/crl/latest", methods=["GET"])
def get_latest_crl():
    try:
        crl = CrlService().get_latest_crl()
        if crl is None:
            return jsonify({"error": "Chưa có CRL nào được tạo"}), 404
        return jsonify(crl.model_dump(mode="json")), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@crl_bp.route("/crl/revocations", methods=["GET"])
def list_recent_revocations():
    try:
        revs = CrlService().get_recent_revocations()
        return jsonify([r.model_dump(mode="json") for r in revs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
