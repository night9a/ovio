# app/modules/auth/utils.py
from datetime import datetime, timedelta, timezone
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from flask import current_app, request
from app.database import db
from .models import RefreshToken
from uuid import uuid4


ph = PasswordHasher()




def hash_password(password: str) -> str:
return ph.hash(password)




def verify_password(hash_: str, password: str) -> bool:
try:
return ph.verify(hash_, password)
except VerifyMismatchError:
return False




def store_refresh_token(user, expires_delta=None):
if expires_delta is None:
expires_delta = current_app.config.get("JWT_REFRESH_TOKEN_EXPIRES", 1209600)
# if config uses seconds, convert to timedelta
if isinstance(expires_delta, int):
expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_delta)
else:
expires_at = datetime.now(timezone.utc) + expires_delta


jti = str(uuid4())
rt = RefreshToken(jti=jti, user=user, expires_at=expires_at)
# optional: capture UA / IP
rt.user_agent = request.headers.get("User-Agent")
rt.ip_address = request.remote_addr
db.session.add(rt)
db.session.commit()
return rt




def revoke_refresh_jti(jti: str):
rt = RefreshToken.query.filter_by(jti=jti).first()
if not rt:
return False
rt.revoked = True
db.session.commit()
return True




def is_refresh_revoked(jti: str) -> bool:
rt = RefreshToken.query.filter_by(jti=jti).first()
if not rt:
return True
if rt.revoked:
return True
return rt.expires_at.replace(tzinfo=None) <= datetime.utcnow()