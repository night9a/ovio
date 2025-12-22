"""Plugin management endpoints."""
from flask import Blueprint, jsonify
from ..services.plugin_service import PluginService, PluginError

bp = Blueprint("plugin", __name__, url_prefix="/plugin")
service = PluginService()

@bp.route("/list_all")
def list_all_plugins():
    try:
        plugins = service.list_all_plugins()
        # Convert SQLAlchemy objects to dictionaries
        plugins_data = [
            {
                "id": p.id,
                "name": p.name,
                "code_name": p.code_name,
                "type": p.type,
                "created_at": p.created_at.isoformat()
            } for p in plugins
        ]
        return jsonify({"plugins": plugins_data})
    except PluginError as e:
        return jsonify({"error": str(e)}), 500

@bp.route("/install", methods=["POST"])
def install_plugin():
    return jsonify({"message": "Plugin installed successfully"}), 201
@bp.route("/remove", methods=["DELETE"])
def remove_plugin():
    return jsonify({"message": "Plugin removed successfully"}), 200
@bp.route("/search", methods=["GET"])
def search_plugins():
    return jsonify({"message": "Search plugins endpoint"}), 200
