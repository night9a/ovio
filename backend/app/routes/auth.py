"""Authentication routes: register, login, forgot/reset password and simple token auth.

Notes:
 - Tokens use itsdangerous URLSafeTimedSerializer and the app SECRET_KEY.
 - In development the password-reset token is returned in the response for convenience.
   In production you should email a reset link instead.
"""
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask import Blueprint, jsonify, request, current_app
from ..extensions import db
from ..models import User
from ..headers.auth_header import require_auth
from ..services.auth_service import register_user, RegisterError
#from functools import wraps

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    try:
        user = register_user(
            email=data.get("email", ""),
            username=data.get("username", ""),
            password=data.get("password"),
            name=data.get("name"),
        )
    except RegisterError as e:
        return jsonify({"error": str(e)}), 400

    token = user.generate_auth_token()

    return jsonify({
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "token": token,
    }), 201


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    token = user.generate_auth_token()
    return jsonify({"token": token, "expires_in": current_app.config.get("AUTH_TOKEN_EXPIRES", 3600)})

@bp.route("/google", methods=["POST"])
def google_login():
    data = request.get_json() or {}
    token = data.get("token")

    if not token:
        return jsonify({"error": "missing google token"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            current_app.config["GOOGLE_CLIENT_ID"],
        )
        print(current_app.config["GOOGLE_CLIENT_ID"])
        google_id = idinfo["sub"]
        email = idinfo["email"].lower()
        name = idinfo.get("name")

    except Exception:
        return jsonify({"error": "invalid google token"}), 401

    # 1. Try google_id
    user = User.query.filter_by(google_id=google_id).first()

    # 2. If not found, try email (account linking)
    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id  # link account
        else:
            # 3. Create new user
            user = User(
                email=email,
                username=email.split("@")[0],
                name=name,
                google_id=google_id,
            )
            db.session.add(user)

        db.session.commit()

    token = user.generate_auth_token()

    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "name": user.name,
        }
    })


@bp.route("/me")
@require_auth
def me():
    user = request.current_user
    return jsonify({"id": user.id, "email": user.email, "username": user.username, "name": user.name})


@bp.route("/forgot", methods=["POST"])
def forgot():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "email required"}), 400

    user = User.query.filter_by(email=email).first()
    # Always return success to avoid user enumeration; in dev return token too
    if not user:
        return jsonify({"success": True}), 200

    token = user.generate_reset_token()
    # In production you would email a reset URL containing the token
    return jsonify({"success": True, "reset_token": token, "reset_expires_in": current_app.config.get("RESET_TOKEN_EXPIRES", 3600 * 24)})


@bp.route("/reset", methods=["POST"])
def reset():
    data = request.get_json() or {}
    token = data.get("token")
    password = data.get("password")
    if not token or not password:
        return jsonify({"error": "token and new password required"}), 400

    user = User.verify_reset_token(token)
    if not user:
        return jsonify({"error": "invalid or expired token"}), 400

    user.set_password(password)
    db.session.commit()
    return jsonify({"success": True})
