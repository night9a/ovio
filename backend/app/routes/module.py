from flask import request,Blueprint,jsonify 


bp = Blueprint("module", __name__, url_prefix="/module")
@bp.route("$<int:id>/list", methods=["GET"])
def list_modules(id):
    # Placeholder implementation
    modules = [
        {"id": 1, "name": "Module A"},
        {"id": 2, "name": "Module B"},
    ]
    return jsonify({"project_id": id, "modules": modules})

