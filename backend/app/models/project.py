"""Basic Project SQLAlchemy model."""
from ..extensions import db
from datetime import datetime
from ..utils.ids import short_id


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.String(32), primary_key=True, default=short_id)
    name = db.Column(db.String(255), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to User
    owner = db.relationship("User", backref="projects")

    def __repr__(self):
        return f"<Project {self.id} {self.name}>"

