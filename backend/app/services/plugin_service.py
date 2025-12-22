from ..utils import msg_serializer
from ..models import Plugin
from app.extensions import db

"""Plugin management service."""
class PluginError(Exception):
    pass

class PluginService:
    def list_all_plugins(self):
        """Return all plugins from the database."""
        try:
            plugins = db.session.query(Plugin).all()
            return plugins
        except Exception as e:
            raise PluginError(f"Failed to list plugins: {e}")
    def search(k):
        result = 1
        return result
