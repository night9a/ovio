#!/usr/bin/env bash
# Start a celery worker
celery -A celeryconfig worker --loglevel=info
