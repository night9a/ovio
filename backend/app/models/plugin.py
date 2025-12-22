"""Plugin SQLAlchemy model with basic metadata."""
from ..extensions import db
from datetime import datetime


class Plugin(db.Model):
    __tablename__ = "plugins"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)               # Human-readable name
    code_name = db.Column(db.String(150), unique=True, nullable=False)  # Internal identifier
    type = db.Column(db.String(50), nullable=False)                # e.g., auth, payment
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Plugin {self.code_name}>"

