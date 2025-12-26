"""One-off script to initialize the development SQLite database.

Usage (Windows cmd):
  D:\project\ovio\venv\Scripts\python.exe init_db.py

This will import models so SQLAlchemy metadata is registered and call
`db.drop_all()` then `db.create_all()` to reset the database.
"""
from app import create_app
from app.config import DevelopmentConfig
from app.extensions import db

# Import models so their metadata is registered
import app.models  # noqa: F401


def main() -> None:
    app = create_app(DevelopmentConfig)
    with app.app_context():
        # Drop all existing tables
        db.drop_all()
        print("All tables dropped.")

        # Recreate tables according to current models
        db.create_all()
        print("Database initialized (tables created).")


if __name__ == "__main__":
    main()

