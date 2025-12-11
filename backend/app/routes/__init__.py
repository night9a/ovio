"""Routes package. Blueprints are defined in modules and imported here for registration."""
from . import auth, projects, relations, export, assets, ai, templates, notifications, plugins, deploy

__all__ = [
    "auth",
    "projects",
    "relations",
    "export",
    "assets",
    "ai",
    "templates",
    "notifications",
    "plugins",
    "deploy",
]
