"""Relation model representing connections between entities."""
from ..extensions import db


class Relation(db.Model):
    __tablename__ = "relations"

    id = db.Column(db.Integer, primary_key=True)
    source_id = db.Column(db.Integer, nullable=False)
    target_id = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(100))

    def __repr__(self):
        return f"<Relation {self.id}: {self.source_id}->{self.target_id}>"
