"""Routes package. Blueprints are defined in modules and imported here for registration."""
from . import auth,editor,setting, projects,snapshot, relations, assets, ai, templates, notifications, plugin, deploy

__all__ = [
    "auth",
    "projects",
    "relations",
    "assets",
    "editor",
    "ai",
    "templates",
    "notifications",
    "plugin",
    "deploy",
    "setting",
    "snapshot",
]
