"""History/versioning snapshots model."""
from datetime import datetime
from ..extensions import db


class Snapshot(db.Model):
    __tablename__ = "snapshots"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, nullable=False)

    # Snapshot metadata
    title = db.Column(db.String(255), nullable=False)
    folder = db.Column(db.String(255), nullable=False)

    # Tree structure: list of dir hashes, ids, names, dates, etc.
    snapshot = db.Column(db.JSON, nullable=False)#tree of editing

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Snapshot id={self.id} project_id={self.project_id}>"

