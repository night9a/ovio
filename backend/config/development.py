# config/development.py
from .default import *


class DevelopmentConfig(DefaultConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///dev_auth.db"
    SQLALCHEMY_ECHO = False
    JWT_ACCESS_TOKEN_EXPIRES = 900 # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRES = 1209600 # 14 days (in seconds)
    JWT_SECRET_KEY = "dev-jwt-secret-change-me"
    
    
    # OAuth placeholders (set env vars in development)
    GOOGLE_CLIENT_ID = "your-google-client-id"
    GOOGLE_CLIENT_SECRET = "your-google-client-secret"
    GOOGLE_REDIRECT_URI = "http://localhost:5000/api/auth/google/callback"
    
    
    GITHUB_CLIENT_ID = "your-github-client-id"
    GITHUB_CLIENT_SECRET = "your-github-client-secret"
    GITHUB_REDIRECT_URI = "http://localhost:5000/api/auth/github/callback"