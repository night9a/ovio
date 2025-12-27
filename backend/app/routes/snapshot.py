from flask import Blueprint, jsonify, request, current_app
from ..extensions import db
from ..models import User
from ..headers.auth_header import require_auth

bp = Blueprint("snapshot", __name__, url_prefix="/snapshot")


@bp.route("/<string:pid>/list", methods=["GET"])
@require_auth
def list_snapshots(pid):
    return jsonify({
        "pid": pid,
        "data": "list"
    })

