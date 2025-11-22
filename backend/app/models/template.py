"""Starter template model."""
from ..extensions import db


class Template(db.Model):
    __tablename__ = "templates"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    data = db.Column(db.JSON)

    def __repr__(self):
        return f"<Template {self.name}>"
