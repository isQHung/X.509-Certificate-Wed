from flask import Blueprint, request, jsonify
from uuid import UUID
from schema.database_schema import SystemConfigCreate, SystemConfigResponse
from core.services.system_config import SystemConfigService

system_config_bp = Blueprint('system_config', __name__, url_prefix='/v1/system_config')

service = SystemConfigService()

# GET ALL
@system_config_bp.route("/", methods=["GET"])
def get_all_configs():
    configs = service.get_all_configs()
    return jsonify([c.model_dump() for c in configs]), 200


# CREATE
@system_config_bp.route("/", methods=["POST"])
def create_config():
    data = request.get_json()

    payload = SystemConfigCreate(**data)
    config = service.create_config(payload)

    return jsonify(config.model_dump()), 201


# GET BY ID
@system_config_bp.route("/<string:config_id>", methods=["GET"])
def get_config_by_id(config_id):
    try:
        config = service.get_config_by_id(UUID(config_id))
    except ValueError:
        return jsonify({"error": "Invalid UUID"}), 400

    if not config:
        return jsonify({"error": "Config not found"}), 404

    return jsonify(config.model_dump())


# GET BY NAME
@system_config_bp.route("/by-name/<string:name>", methods=["GET"])
def get_config_by_name(name):
    config = service.get_config_by_name(name)

    if not config:
        return jsonify({"error": "Config not found"}), 404

    return jsonify(config.model_dump())


# UPDATE
@system_config_bp.route("/<string:config_id>", methods=["PUT"])
def update_config(config_id):
    data = request.get_json()

    try:
        uuid_val = UUID(config_id)
    except ValueError:
        return jsonify({"error": "Invalid UUID"}), 400

    payload = SystemConfigCreate(**data)
    config = service.update_config(uuid_val, payload)

    if not config:
        return jsonify({"error": "Config not found"}), 404

    return jsonify(config.model_dump())


# DELETE
@system_config_bp.route("/<string:config_id>", methods=["DELETE"])
def delete_config(config_id):
    try:
        uuid_val = UUID(config_id)
    except ValueError:
        return jsonify({"error": "Invalid UUID"}), 400

    success = service.delete_config(uuid_val)

    if not success:
        return jsonify({"error": "Config not found"}), 404

    return jsonify({"message": "Deleted successfully"})