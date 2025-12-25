"""Asset model for uploaded files, images, icons."""
from ..extensions import db
from datetime import datetime


class Asset(db.Model):
    __tablename__ = "assets"

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(512))
    mimetype = db.Column(db.String(128))
    size = db.Column(db.Integer)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Asset {self.filename}>"
