from ..headers.auth_header import require_auth
from ..services.editor_service import edit
#from functools import wraps

bp = Blueprint("editor", __name__, url_prefix="/editor")


@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
