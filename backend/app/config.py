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
    GOOGLE_CLIENT_ID = "814124596804-o07r8uokfces627sar5l0gk1ihacp1u5.apps.googleusercontent.com"
    GITHUB_CLINET_ID = ""
class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
