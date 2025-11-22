"""History/versioning snapshots model."""
from ..extensions import db
from datetime import datetime


class History(db.Model):
    __tablename__ = "histories"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, nullable=False)
    snapshot = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<History {self.id} for project {self.project_id}>"
