import os
from flask import current_app
from ..extensions import db
from ..models import Project
from ..utils.msg_serializer import MsgSerializer
from datetime import datetime
from ..utils.ids import short_id


class ProjectError(Exception):
    pass


class ProjectService:

    @staticmethod
    def get_storage_root():
        """Compute storage root inside app context."""
        return os.path.abspath(
            os.path.join(current_app.root_path, "..", "storage/projects")
        )

    @staticmethod
    def delete_project(user, pid):
        project = Project.query.filter_by(id=pid, owner_id=user.id).first()
        if not project:
            raise ProjectError("project not found")

        db.session.delete(project)
        db.session.commit()

        storage_root = ProjectService.get_storage_root()
        proj_dir = os.path.join(storage_root, str(pid))

        try:
            # Remove the project directory if empty
            os.rmdir(proj_dir)
        except Exception as e:
            current_app.logger.error("failed to delete project storage: %s", e)

    @staticmethod
    def list_projects(user=None):
        return Project.query.filter_by(owner_id=user.id).all()

    @staticmethod
    def create_project(user, data):
        name = (data.get("name") or "").strip()
        description = (data.get("description") or "").strip()

        if not name:
            raise ProjectError("project name is required")

        existing = Project.query.filter_by(name=name, owner_id=user.id).first()
        if existing:
            raise ProjectError("project with this name already exists")
        project = Project(name=name, owner_id=user.id)
        db.session.add(project)
        db.session.commit()
        
        storage_root = ProjectService.get_storage_root()
        os.makedirs(storage_root, exist_ok=True)
        print("done")
        proj_dir = os.path.join(storage_root, str(project.id), "autosave")
        os.makedirs(proj_dir, exist_ok=True)
        print("maybe")
        # directories
        relation_dir = os.path.join(proj_dir, "relation")
        ui_dir = os.path.join(proj_dir, "ui")
        module_dir = os.path.join(proj_dir, "module")
        os.makedirs(relation_dir, exist_ok=True)
        os.makedirs(ui_dir, exist_ok=True)
        os.makedirs(module_dir, exist_ok=True)
        
        # msgpack paths
        meta_path = os.path.join(proj_dir, "meta_data.msgpack")
        plugin_path = os.path.join(proj_dir, "plugin.msgpack")
        
        relation_browser_path = os.path.join(relation_dir, "browser.msgpack")
        ui_browser_path = os.path.join(ui_dir, "browser.msgpack")
        module_browser_path = os.path.join(module_dir, "browser.msgpack")
        
        ui_main_path = os.path.join(ui_dir, "main.msgpack")
        relation_main_path = os.path.join(relation_dir, "main.msgpack")
        print("baby")
        try:
            # meta
            MsgSerializer(meta_path)._save({
                "id": project.id,
                "name": project.name,
                "description": description,
                "version": "0.0.1",
                "created_at": datetime.utcnow().isoformat()
            })
        
            page_id = short_id()
            action_id = short_id()
        
            # ui browser → points to main
            MsgSerializer(ui_browser_path)._save({
                "pages": [
                    {
                        "pid": page_id,
                        "name": "main",
                        "entry": True,
                        "created_at": datetime.utcnow().isoformat()
                    }
                ]
            })
        
            # relation browser → points to main
            MsgSerializer(relation_browser_path)._save({
                "scripts": [
                    {
                        "name": "main",
                        "entry": True,
                        "created_at": datetime.utcnow().isoformat()
                    }
                ]
            })
        
            # ui/main.msgpack
            MsgSerializer(ui_main_path)._save({
                "page": "main",
                "elements": [
                    {"type": "text", "value": "Hello World"},
                    {"type": "button", "value": "Click Me", "action_id": action_id}
                ]
            })
            
            # relation/main.msgpack
            MsgSerializer(relation_main_path)._save({
                "scripts": [
                    {
                        "action_id": action_id,
                        "response": {
                            "type": "pop_msg",
                            "msg": "button clicked"
                        }
                    }
                ]
            })
            
            # empty plugin & module browser
            MsgSerializer(plugin_path)._save({})
            MsgSerializer(module_browser_path)._save({})
        
        except Exception as e:
            current_app.logger.error("failed to create project storage: %s", e)
        
        return project
        
