"""Flask app factory for ovio backend.

This module provides create_app() to build and configure the Flask app.
"""
from flask import Flask
from .config import DevelopmentConfig
from .extensions import init_extensions


def create_app(config_object=None):
    """Create and configure the Flask application.

    Args:
        config_object: config class or import path. Defaults to DevelopmentConfig.

    Returns:
        Flask app
    """
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_object or DevelopmentConfig)

    # initialize extensions (db, socketio, etc.)
    init_extensions(app)

    # register blueprints lazily to avoid circular imports
    from .routes import auth, projects  # noqa: E402

    app.register_blueprint(auth.bp)
    app.register_blueprint(projects.bp)

    return app
