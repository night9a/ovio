"""Assets upload/download endpoints (placeholder)."""
from flask import Blueprint, jsonify

bp = Blueprint("assets", __name__, url_prefix="/assets")


@bp.route("/ping")
def ping():
    return jsonify({"status": "ok", "module": "assets"})
