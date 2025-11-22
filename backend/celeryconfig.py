"""Basic celery configuration for backend."""
from os import environ

broker_url = environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
