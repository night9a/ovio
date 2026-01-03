from ..models import Snapshot
from app.extensions import db

class SnapshotError(Exception):
    pass

class SnapshotService():
    def create(data):
        data['project_id']
        tree
        snap = Snapshot(project_id,title,folder_id,snapshot=tree)
        db.session.add(snap)
        db.session.commit()

        return snap
        
    def list():
        return Snapshot.query.filter_by(owner_id=user.id).all()

    
