# app/modules/auth/routes.py


from app.database import db
from . import auth_bp
from .models import User, RefreshToken
from .schemas import RegisterSchema, LoginSchema
from .utils import hash_password, verify_password, store_refresh_token, revoke_refresh_jti, is_refresh_revoked




# ------- Registration -------


@auth_bp.route("/register", methods=["POST"])
def register():
data = request.get_json() or {}
errors = RegisterSchema().validate(data)
if errors:
return jsonify({"errors": errors}), 400


email = data["email"].lower()
if User.query.filter_by(email=email).first():
return jsonify({"msg": "email already registered"}), 400


user = User(email=email, password_hash=hash_password(data["password"]), name=data.get("name"))
db.session.add(user)
db.session.commit()
return jsonify({"msg": "registered"}), 201




# ------- Login (password) -------


@auth_bp.route("/login", methods=["POST"])
def login():
data = request.get_json() or {}
errors = LoginSchema().validate(data)
if errors:
return jsonify({"errors": errors}), 400


email = data["email"].lower()
user = User.query.filter_by(email=email).first()
if not user or not user.password_hash or not verify_password(user.password_hash, data["password"]):
return jsonify({"msg": "invalid credentials"}), 401


# create access + refresh
access = create_access_token(identity=user.id, expires_delta=timedelta(seconds=current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES", 900)))


# store refresh token record
rt = store_refresh_token(user, expires_delta=current_app.config.get("JWT_REFRESH_TOKEN_EXPIRES", 1209600))


# create refresh JWT including jti
refresh = create_refresh_token(identity=user.id, additional_claims={"jti": rt.jti})


resp = jsonify({"access_token": access})
# Set cookie: adjust domain/secure in real deployment
resp.set_cookie(
"refresh_token",
refresh,
httponly=True,
secure=False, # development: False if not HTTPS; set True in production
samesite="Lax",
expires=rt.expires_at
)
return resp, 200




# ------- Refresh -------


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
refresh_token = request.cookies.get("refresh_to