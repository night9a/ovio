from datetime import datetime
from app.extensions import db
import app.models.traffic as TrafficEvent

class TrafficService:
    @staticmethod
    def record(*, user_id, project_id, path, method, status, bytes_sent, latency_ms):
        event = TrafficEvent(
            user_id=user_id,
            project_id=project_id,
            path=path,
            method=method,
            status=status,
            bytes_sent=bytes_sent,
            latency_ms=latency_ms,
            created_at=datetime.utcnow()
        )
        db.session.add(event)
        db.session.commit()