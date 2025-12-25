from ..models import User
from app.extensions import db

class AuthError(Exception):
    pass
class AuthService:
    @staticmethod
    def register_user(email: str, username: str, password: str, name: str | None = None) -> User:
        email = email.strip().lower()
        username = username.strip()
    
        if not email or not username or not password:
            raise AuthError("email, username and password are required")
    
        if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
            raise AuthError("user with provided email/username already exists")
    
        user = User(email=email, username=username, name=name)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
    
        return user
    @staticmethod
    def login_user(email: str, password: str):
    
        if not email or not password:
            raise AuthError("email and password are required")
    
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            raise AuthError("invalid credentials")
    
        return user.generate_auth_token()
