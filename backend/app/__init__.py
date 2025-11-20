# app/__init__.py
import os
from flask import Flask
from config import Config
from .database import db, migrate
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)




def create_app(config_object=None):
app = Flask(__name__, template_folder="templates")


# load config
if config_object is None:
app.config.from_object(Config)
else:
app.config.from_object(config_object)


# init extensions
db.init_app(app)
migrate.init_app(app, db)
jwt.init_app(app)
limiter.init_app(app)


# register blueprints
from .modules.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")


# example protected route
@app.route("/api/hello")
def hello():
return {"msg": "Hello from backend"}


return app