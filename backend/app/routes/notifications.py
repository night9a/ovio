"""Notification endpoints (placeholder)."""
from flask import Blueprint, jsonify

bp = Blueprint("notifications", __name__, url_prefix="/notifications")


@bp.route("/ping")
def ping():
    return jsonify({"status": "ok", "module": "notifications"})
