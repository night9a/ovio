import os
from flask import current_app
from ..extensions import db
from ..models import Project
from ..utils.msg_serializer import MsgSerializer
from datetime import datetime


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

        proj_dir = os.path.join(storage_root, str(project.id), "autosave")
        os.makedirs(proj_dir, exist_ok=True)

        # directories
        relation_dir = os.path.join(proj_dir, "relation")
        ui_dir = os.path.join(proj_dir, "ui")
        module_dir = os.path.join(proj_dir, "module")
        os.makedirs(relation_dir, exist_ok=True)
        os.makedirs(ui_dir, exist_ok=True)
        os.makedirs(module_dir, exist_ok=True)

        # paths for msgpack files
        meta_path = os.path.join(proj_dir, "meta_data.msgpack")
        plugin_path = os.path.join(proj_dir, "plugin.msgpack")
        relation_browser_path = os.path.join(relation_dir, "browser.msgpack")
        ui_browser_path = os.path.join(ui_dir, "browser.msgpack")
        module_browser_path = os.path.join(module_dir, "browser.msgpack")
        ui_default_path = os.path.join(ui_dir, "default.msgpack")
        relation_script_path = os.path.join(relation_dir, "default.msgpack")

        try:
            # initialize meta_data.msgpack
            meta = MsgSerializer(meta_path)
            meta._save({
                "id": project.id,
                "name": project.name,
                "description": description,
                "version": "0.0.1",
                "created_at": datetime.utcnow().isoformat()
            })


            # initialize ui_browser.msgpack with main UI page
            ui_init = MsgSerializer(ui_browser_path)
            ui_init._save({
                "pid": short_id(),
                "name": "main",
                "created_at": datetime.utcnow().isoformat()
            })

            # create a default UI page
            ui_default = MsgSerializer(ui_default_path)
            ui_default._save({
                "page": "default",
                "elements": [
                    {"type": "text", "value": "Hello World"},
                    {"type": "button", "value": "Click Me", "action_id": short_id()}
                ]
            })

            ui_data = ui_default._load()

            # backend script for button
            backend_script = MsgSerializer(relation_script_path)
            backend_script._save({
                "scripts": [
                    {
                        "action_id": ui_data["elements"][1]["action_id"],
                        "response": "Button clicked successfully!"
                    }
                ]
            })

            # create empty plugin and module browser files
            MsgSerializer(plugin_path)._save({})
            MsgSerializer(module_browser_path)._save({})

        except Exception as e:
            current_app.logger.error("failed to create project storage: %s", e)

        return project

