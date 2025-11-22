"""Plugin management endpoints (placeholder)."""
from flask import Blueprint, jsonify

bp = Blueprint("plugins", __name__, url_prefix="/plugins")


@bp.route("/list")
def list_plugins():
    return jsonify({"plugins": []})
