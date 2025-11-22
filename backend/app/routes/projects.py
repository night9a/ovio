"""Project-related routes (placeholder)."""
from flask import Blueprint, jsonify

bp = Blueprint("projects", __name__, url_prefix="/projects")


@bp.route("/")
def list_projects():
    return jsonify({"projects": []})
