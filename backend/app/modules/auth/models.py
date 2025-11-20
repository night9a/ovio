# app/modules/auth/models.py
from datetime import datetime, timezone
from uuid import uuid4
from app.database import db




class User(db.Model):
__tablename__ = "users"
id = db.Column(db.Integer, primary_key=True)
email = db.Column(db.String(320), unique=True, nullable=False, index=True)
password_hash = db.Column(db.String(512), nullable=True)
name = db.Column(db.String(255), nullable=True)
created_at = db.Column(db.DateTime, default=datetime.utcnow)
token_version = db.Column(db.Integer, default=0)


# OAuth providers
google_id = db.Column(db.String(255), nullable=True, unique=True)
github_id = db.Column(db.String(255), nullable=True, unique=True)


def __repr__(self):
return f"<User {self.email}>"




class RefreshToken(db.Model):
__tablename__ = "refresh_tokens"
id = db.Column(db.Integer, primary_key=True)
jti = db.Column(db.String(36), unique=True, index=True, nullable=False)
user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
user = db.relationship("User", backref="refresh_tokens")
user_agent = db.Column(db.String(512), nullable=True)
ip_address = db.Column(db.String(45), nullable=True)
created_at = db.Column(db.DateTime, default=datetime.utcnow)
expires_at = db.Column(db.DateTime, nullable=False)
revoked = db.Column(db.Boolean, default=False)


@staticmethod
def create_for_user(user, expires_at):
j = str(uuid4())
token = RefreshToken(jti=j, user=user, expires_at=expires_at)
return token


def is_active(self):
return (not self.revoked) and (self.expires_at.replace(tzinfo=None) > datetime.utcnow())