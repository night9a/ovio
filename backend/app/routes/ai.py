"""Local LLM routes (placeholder)."""
from flask import Blueprint, request, jsonify

bp = Blueprint("ai", __name__, url_prefix="/ai")


@bp.route("/prompt", methods=["POST"])
def prompt():
    payload = request.json or {}
    return jsonify({"response": "This is a placeholder response.", "input": payload})
