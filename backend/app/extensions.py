"""Initialize third-party extensions (DB, SocketIO, Celery, cache, etc.)."""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO

# Lightweight placeholders — import and initialize in create_app via init_extensions

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO()


def init_extensions(app):
    """Bind initialized extensions to the Flask app."""
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)
    # Additional extensions (cache, celery, llm client) should be wired here
