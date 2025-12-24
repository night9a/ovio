from flask import Blueprint,jsonify
from ..headers.auth_header import require_auth

bp = Blueprint("setting", __name__, url_prefix="/setting")


@bp.route("/")
@require_auth
def setting_fetch():
    return "test"


@bp.route("/update",methods=["PUT"])
@require_auth
def setting_update():
    return "test"

