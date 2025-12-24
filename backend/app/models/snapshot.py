"""History/versioning snapshots model."""
from ..extensions import db
from datetime import datetime


class Snapshot(db.Model):
    __tablename__ = "snapshots"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, nullable=False)
    #list of dir hashes with id and folder name and date and edit name 
    snapshot = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<History {self.id} for project {self.project_id}>"
