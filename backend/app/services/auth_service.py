from ..models import User
from app.extensions import db

class RegisterError(Exception):
    pass
def register_user(email: str, username: str, password: str, name: str | None = None) -> User:
    email = email.strip().lower()
    username = username.strip()

    if not email or not username or not password:
        raise RegisterError("email, username and password are required")

    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        raise RegisterError("user with provided email/username already exists")

    user = User(email=email, username=username, name=name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return user
