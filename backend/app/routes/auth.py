"""Authentication routes: register, login, forgot/reset password and simple token auth.

Notes:
 - Tokens use itsdangerous URLSafeTimedSerializer and the app SECRET_KEY.
 - In development the password-reset token is returned in the response for convenience.
   In production you should email a reset link instead.
"""
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask import Blueprint, jsonify, request, current_app, redirect
from ..extensions import db
from ..models import User
from ..headers.auth_header import require_auth
from ..services.auth_service import AuthService, AuthError
import requests
import secrets
import base64
import json
from urllib.parse import urlencode

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    try:
        user = AuthService.register_user(
            email=data.get("email", ""),
            username=data.get("username", ""),
            password=data.get("password"),
            name=data.get("name"),
        )
    except AuthError as e:
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
    try:
        token = AuthService.login_user(
            email=email,
            password=password,
        )
    except AuthError as e:
        return jsonify({"error": str(e)}), 400
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
            # 3. Create new user (OAuth-only: set unguessable password)
            user = User(
                email=email,
                username=email.split("@")[0],
                name=name,
                google_id=google_id,
            )
            user.set_password(secrets.token_urlsafe(32))
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



@bp.route("/github", methods=["POST"])
def github_login():
    data = request.get_json() or {}
    access_token = data.get("token")

    if not access_token:
        return jsonify({"error": "missing github token"}), 400

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }

    # 1. Get GitHub user profile
    user_resp = requests.get("https://api.github.com/user", headers=headers)
    if user_resp.status_code != 200:
        return jsonify({"error": "invalid github token"}), 401

    gh_user = user_resp.json()
    github_id = str(gh_user["id"])
    username = gh_user["login"]
    name = gh_user.get("name")

    # 2. Get primary email
    email_resp = requests.get("https://api.github.com/user/emails", headers=headers)
    if email_resp.status_code != 200:
        return jsonify({"error": "cannot fetch github email"}), 401

    emails = email_resp.json()
    primary_email = next(
        (e["email"].lower() for e in emails if e["primary"] and e["verified"]),
        None
    )

    if not primary_email:
        return jsonify({"error": "no verified email found"}), 400

    # 3. Try github_id
    user = User.query.filter_by(github_id=github_id).first()

    # 4. Account linking by email
    if not user:
        user = User.query.filter_by(email=primary_email).first()
        if user:
            user.github_id = github_id
        else:
            user = User(
                email=primary_email,
                username=username,
                name=name,
                github_id=github_id,
            )
            user.set_password(secrets.token_urlsafe(32))
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


@bp.route("/github/authorize", methods=["GET"])
def github_authorize():
    # frontend redirect after login (internal use only)
    frontend_redirect = request.args.get("redirect_uri", "").strip()
    if not frontend_redirect:
        frontend_redirect = current_app.config.get("FRONTEND_URL")

    if not frontend_redirect:
        return jsonify({"error": "redirect_uri required"}), 400

    client_id = current_app.config.get("GITHUB_CLIENT_ID")
    if not client_id:
        return jsonify({"error": "GitHub OAuth not configured"}), 503

    backend_callback = "http://localhost:5000/auth/github/callback"

    state = base64.urlsafe_b64encode(
        json.dumps({"redirect_uri": frontend_redirect}).encode()
    ).decode()

    params = {
        "client_id": client_id,
        "redirect_uri": backend_callback,
        "scope": "user:email",
        "state": state,
    }

    return redirect(
        "https://github.com/login/oauth/authorize?" + urlencode(params)
    )


@bp.route("/github/callback", methods=["GET"])
def github_callback():
    """Exchange code for access token, find/create user, redirect to frontend with token."""
    code = request.args.get("code")
    state = request.args.get("state")
    if not code:
        return jsonify({"error": "missing code"}), 400
    client_id = current_app.config.get("GITHUB_CLIENT_ID")
    client_secret = current_app.config.get("GITHUB_CLIENT_SECRET")
    if not client_id or not client_secret:
        return jsonify({"error": "GitHub OAuth not configured"}), 503
    base = (current_app.config.get("GITHUB_CALLBACK_BASE") or "").strip().rstrip("/")
    if not base:
        base = request.host_url.rstrip("/")
    redirect_uri = base + "/auth/github/callback"
    resp = requests.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        },
        headers={"Accept": "application/json"},
    )
    if resp.status_code != 200:
        return jsonify({"error": "GitHub token exchange failed"}), 502
    data = resp.json()
    access_token = data.get("access_token")
    if not access_token:
        return jsonify({"error": "no access_token from GitHub"}), 502
    try:
        frontend_redirect = request.host_url
        if state:
            decoded = base64.urlsafe_b64decode(state.encode())
            frontend_redirect = json.loads(decoded).get("redirect_uri", frontend_redirect)
    except Exception:
        frontend_redirect = request.host_url
    # Reuse same logic as POST /auth/github
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }
    user_resp = requests.get("https://api.github.com/user", headers=headers)
    if user_resp.status_code != 200:
        return redirect(frontend_redirect + "?error=invalid_github_token")
    gh_user = user_resp.json()
    github_id = str(gh_user["id"])
    username = gh_user["login"]
    name = gh_user.get("name")
    email_resp = requests.get("https://api.github.com/user/emails", headers=headers)
    if email_resp.status_code != 200:
        return redirect(frontend_redirect + "?error=github_email_failed")
    emails = email_resp.json()
    primary_email = next(
        (e["email"].lower() for e in emails if e["primary"] and e["verified"]),
        None,
    )
    if not primary_email:
        return redirect(frontend_redirect + "?error=no_verified_email")
    user = User.query.filter_by(github_id=github_id).first()
    if not user:
        user = User.query.filter_by(email=primary_email).first()
        if user:
            user.github_id = github_id
        else:
            user = User(
                email=primary_email,
                username=username,
                name=name,
                github_id=github_id,
            )
            user.set_password(secrets.token_urlsafe(32))
            db.session.add(user)
        db.session.commit()
    token = user.generate_auth_token()
    sep = "&" if "?" in frontend_redirect else "?"
    return redirect(frontend_redirect + sep + "token=" + token)


@bp.route("/config")
def auth_config():
    """Public OAuth client config for frontend (e.g. Google client ID)."""
    return jsonify({
        "google_client_id": current_app.config.get("GOOGLE_CLIENT_ID") or "",
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
