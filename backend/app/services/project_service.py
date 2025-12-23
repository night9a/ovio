import os
import json
from flask import current_app
from ..extensions import db
from ..models import Project
from ..utils.msg_serializer import MsgSerializer
from datetime import datetime
class ProjectError(Exception):
    pass


class ProjectService:
    @staticmethod
    def delete_project(user,pid):
        project = Project.query.filter_by(id=pid, owner_id=user.id).first()
        
        if not project:
            raise ProjectError("project not found")
        
        db.session.delete(project)
        db.session.commit()
        
    @staticmethod
    def list_projects(user=None):
        return Project.query.filter_by(owner_id=user.id).all()
    @staticmethod
    def create_project(user, data):
        name = (data.get("name") or "").strip()
        description = (data.get("description") or "").strip()
    
        if not name:
            raise ProjectError("project name is required")
    
        existing = Project.query.filter_by(
            name=name,
            owner_id=user.id
        ).first()
    
        if existing:
            raise ProjectError("project with this name already exists")
    
        project = Project(
            name=name,
            owner_id=user.id
        )
    
        db.session.add(project)
        db.session.commit()
    
        try:
            storage_root = os.path.abspath(
                os.path.join(current_app.root_path, "..", "projects_storage")
            )
            os.makedirs(storage_root, exist_ok=True)
    
            proj_dir = os.path.join(storage_root, str(project.id))
            os.makedirs(proj_dir, exist_ok=True)
    
            # directories
            backend_dir = os.path.join(proj_dir, "backend")
            frontend_dir = os.path.join(proj_dir, "frontend")
            module_dir = os.path.join(proj_dir, "module")
    
            os.makedirs(backend_dir, exist_ok=True)
            os.makedirs(frontend_dir, exist_ok=True)
            os.makedirs(module_dir, exist_ok=True)
    
            # files
            meta_path = os.path.join(proj_dir, "meta_data.msgpack")
            plugin_path = os.path.join(proj_dir, "plugin.msgpack")
            backend_browser_path = os.path.join(backend_dir, "browser.msgpack")
            frontend_browser_path = os.path.join(frontend_dir, "browser.msgpack")
            module_browser_path = os.path.join(module_dir, "browser.msgpack")
    
            # meta_data.msgpack (initial content)
            meta = MsgSerializer(meta_path)
            meta._save({
                "id": project.id,
                "name": project.name,
                "description": description,
                "created_at": datetime.utcnow().isoformat()
            })
    
            # create empty msgpack files (no initial data)
            MsgSerializer(plugin_path)._save({})
            MsgSerializer(backend_browser_path)._save({})
            MsgSerializer(frontend_browser_path)._save({})
            MsgSerializer(module_browser_path)._save({})
    
        except Exception as e:
            current_app.logger.error(
                "failed to create project storage: %s", e
            )
    
        return project
    
