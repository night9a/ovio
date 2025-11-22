"""Template management endpoints (placeholder)."""
from flask import Blueprint, jsonify

bp = Blueprint("templates", __name__, url_prefix="/templates")


@bp.route("/list")
def list_templates():
    return jsonify({"templates": []})
