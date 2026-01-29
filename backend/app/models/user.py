"""User SQLAlchemy model with password hashing and token helpers."""
from ..extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app
from itsdangerous import URLSafeTimedSerializer as Serializer


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(255), unique=True, nullable=True, default=None)
    github_id = db.Column(db.String(255), unique=True, nullable=True, default=None)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255))
    avatar = db.Column(db.String(512),nullable=True,default=None)
    #company_name = 
    #role = 
    #email_update = 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email}>"

    # Password helpers
    def set_password(self, password: str) -> None:
        """Hash & store the password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify a plaintext password against stored hash."""
        return check_password_hash(self.password_hash or "", password)

    # Authentication token (short lived)
    def generate_auth_token(self) -> str:
        s = Serializer(current_app.config["SECRET_KEY"])
        return s.dumps({"id": self.id})

    @staticmethod
    def verify_auth_token(token: str):
        s = Serializer(current_app.config["SECRET_KEY"])
        try:
            data = s.loads(token, max_age=current_app.config.get("AUTH_TOKEN_EXPIRES", 3600))
        except Exception:
            return None
        user_id = data.get("id")
        if not user_id:
            return None
        return User.query.get(user_id)

    # Password reset token (longer lived)
    def generate_reset_token(self) -> str:
        s = Serializer(current_app.config["SECRET_KEY"])
        return s.dumps({"reset": self.id})

    @staticmethod
    def verify_reset_token(token: str):
        s = Serializer(current_app.config["SECRET_KEY"])
        try:
            data = s.loads(token, max_age=current_app.config.get("RESET_TOKEN_EXPIRES", 3600 * 24))
        except Exception:
            return None
        user_id = data.get("reset")
        if not user_id:
            return None
        return User.query.get(user_id)
