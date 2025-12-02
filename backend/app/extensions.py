"""Initialize third-party extensions (DB, SocketIO, Celery, cache, etc.)."""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_cors import CORS

# Lightweight placeholders — import and initialize in create_app via init_extensions

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO()
cors = CORS()


def init_extensions(app):
    """Bind initialized extensions to the Flask app."""
    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}, r"/auth/*": {"origins": "*"}})
    # Additional extensions (cache, celery, llm client) should be wired here
