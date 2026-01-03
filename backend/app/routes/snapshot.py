from flask import Blueprint, jsonify, request, current_app
from ..extensions import db
from ..models import User
from ..services import SnapshotService,SnapshotError
from ..headers.auth_header import require_auth

bp = Blueprint("snapshot", __name__, url_prefix="/snapshot")

@bp.route("/<string:pid>/create", methods=["POST"])
@require_auth
def create_snapshot(pid):
    data = request.get_json() or {}

    return jsonify({
        "pid": pid,
        "data": "list"
    })

@bp.route("/<string:pid>/list", methods=["GET"])
@require_auth
def list_snapshots(pid):
    return jsonify({
        "pid": pid,
        "data": "list"
    })

