# app/modules/auth/__init__.py
from flask import Blueprint


auth_bp = Blueprint("auth", __name__)


# import views to register routes
from . import routes # noqa: F401