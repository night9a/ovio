"""Authentication routes (placeholder)."""
from flask import Blueprint, jsonify

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.route("/ping")
def ping():
    return jsonify({"status": "ok", "module": "auth"})
