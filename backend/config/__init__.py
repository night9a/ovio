# config/__init__.py
from os import environ
from importlib import import_module


_env = environ.get("FLASK_CONFIG", "development")
config = import_module(f"config.{_env}")
Config = getattr(config, f"{_env.capitalize()}Config", None) or config