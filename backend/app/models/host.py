"""Host/Deployment model to track deployed apps."""
from ..extensions import db
from datetime import datetime


class Host(db.Model):
    __tablename__ = "hosts"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    url = db.Column(db.String(255), nullable=False, unique=True)  # e.g., /app/myproject-abc123
    deployment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default="active")  # 'active', 'archived', 'draft'
    
    # Relationship to Project
    project = db.relationship("Project", backref="hosts")

    def __repr__(self):
        return f"<Host {self.url}>"
