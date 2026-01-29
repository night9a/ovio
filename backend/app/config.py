"""Configuration objects for Flask application."""
import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///ovio.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    # Authentication / token expirations (seconds)
    AUTH_TOKEN_EXPIRES = int(os.environ.get("AUTH_TOKEN_EXPIRES", 3600))
    IP_WHITE_LIST = ['192.168.100.19']
    RESET_TOKEN_EXPIRES = int(os.environ.get("RESET_TOKEN_EXPIRES", 3600 * 24))
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "814124596804-o07r8uokfces627sar5l0gk1ihacp1u5.apps.googleusercontent.com")
    GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID", "Ov23ctGp7a3f3YLas5XA")
    GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET", "68cd38fc11d47c394aa37a1ea675ebd7484bbb5a")
    # Base URL of this backend (no trailing slash). Used as GitHub OAuth redirect_uri base.
    # Must match exactly what you set in GitHub OAuth App → Authorization callback URL.
    # Example: http://localhost:5000 or https://api.yourdomain.com
    GITHUB_CALLBACK_BASE = os.environ.get("GITHUB_CALLBACK_BASE", "")
    # Default frontend URL when redirect_uri is not sent (e.g. http://localhost:5173)
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    MJ_APIKEY_PUBLIC="d6add4869a76c58daf0be4e6aea63bae"
    MJ_APIKEY_PRIVATE="5b5cb65d4a7d19fa9f9d551b69f9607f"
    MAIL = "nightxcros@gmail.com"
class DevelopmentConfig(Config):
    DEBUG = True
    # So GitHub OAuth callback URL is http://localhost:5000/auth/github/callback
    GITHUB_CALLBACK_BASE = os.environ.get("GITHUB_CALLBACK_BASE", "http://localhost:5000")


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
