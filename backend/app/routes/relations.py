"""Relations API routes (placeholder)."""
from flask import Blueprint, jsonify

bp = Blueprint("relations", __name__, url_prefix="/relations")


@bp.route("/ping")
def ping():
    return jsonify({"status": "ok", "module": "relations"})
