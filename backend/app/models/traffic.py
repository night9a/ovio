from app.extensions import db

class TrafficEvent(db.Model):
    __tablename__ = "traffic_events"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, index=True)
    project_id = db.Column(db.Integer, index=True)

    path = db.Column(db.String(255))
    method = db.Column(db.String(8))
    status = db.Column(db.Integer)

    bytes_sent = db.Column(db.Integer)
    latency_ms = db.Column(db.Integer)

    created_at = db.Column(db.DateTime, index=True)
    