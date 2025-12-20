#provide auth wrap header
from functools import wraps
from flask import request
from ..models import User

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "missing token"}), 401
        token = auth.split(" ", 1)[1]
        user = User.verify_auth_token(token)
        if not user:
            return jsonify({"error": "invalid or expired token"}), 401
        # attach current user to request for downstream handlers
        request.current_user = user
        return fn(*args, **kwargs)

    return wrapper

