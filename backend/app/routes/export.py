"""Export endpoints (placeholder)."""
from flask import Blueprint, jsonify

bp = Blueprint("export", __name__, url_prefix="/export")


@bp.route("/status")
def status():
    return jsonify({"export": "idle"})
