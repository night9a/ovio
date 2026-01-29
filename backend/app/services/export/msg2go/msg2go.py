import os
from flask import current_app

from ....utils.msg_serializer import MsgSerializer
from ...project_service import ProjectService
from .composer import Composer
from .roller import Roller


class Run:
    def __init__(self, pid):
        self.pid = pid

    # -------------------------
    # Paths
    # -------------------------

    def get_project_dirs(self):
        projects_root = ProjectService.get_storage_root()
        # /mnt/hdd/projects/ovio/backend/storage/projects
    
        storage_base = os.path.dirname(projects_root)
        # /mnt/hdd/projects/ovio/backend/storage
    
        proj_dir = os.path.join(projects_root, str(self.pid), "autosave")
        ui_dir = os.path.join(proj_dir, "ui")
        relation_dir = os.path.join(proj_dir, "relation")
    
        export_dir = os.path.join(storage_base, "export/source", str(self.pid))
    
        return {
            "ui": ui_dir,
            "relation": relation_dir,
            "export": export_dir,
        }
    

    # -------------------------
    # Load msgpack
    # -------------------------

    def get_src(self):
        dirs = self.get_project_dirs()

        ui_main_path = os.path.join(dirs["ui"], "main.msgpack")
        relation_main_path = os.path.join(dirs["relation"], "main.msgpack")

        ui = MsgSerializer(ui_main_path)._load()
        relation = MsgSerializer(relation_main_path)._load()

        return ui, relation

    # -------------------------
    # Roller: relation -> action_id -> handler snippets (getters from func/)
    # -------------------------

    def call_roller(self) -> dict:
        _, relation = self.get_src()
        return Roller(relation).build()

    # -------------------------
    # Composer: ui + action_handlers -> main.go source
    # -------------------------

    def call_composer(self) -> str:
        ui, relation = self.get_src()
        action_handlers = Roller(relation).build()
        comp = Composer(ui, action_handlers=action_handlers)
        return comp.build()
    # -------------------------
    # Runner
    # -------------------------

    def run(self):
        """
        Build UI + actions (Roller) → write main.go to export directory.
        Create go.mod if missing.
        """
        go_code = self.call_composer()
    
        dirs = self.get_project_dirs()
        export_dir = dirs["export"]
        print(export_dir)
        os.makedirs(export_dir, exist_ok=True)
    
        # Write main.go
        main_go_path = os.path.join(export_dir, "main.go")
        with open(main_go_path, "w", encoding="utf-8") as f:
            f.write(go_code)
    
        # -------------------------
        # Ensure go.mod exists
        # -------------------------
        go_mod_path = os.path.join(export_dir, "go.mod")
        if not os.path.exists(go_mod_path):
            go_mod_template = """module gio.test
    
    go 1.24.9
    
    require gioui.org v0.9.0
    
    require (
        gioui.org/shader v1.0.8 // indirect
        github.com/ajstarks/giocanvas v0.0.0-20250916212156-784777e05a11 // indirect
        github.com/go-text/typesetting v0.3.0 // indirect
        golang.org/x/exp/shiny v0.0.0-20250408133849-7e4ce0ab07d0 // indirect
        golang.org/x/image v0.26.0 // indirect
        golang.org/x/sys v0.33.0 // indirect
        golang.org/x/text v0.24.0 // indirect
    )
    """
            with open(go_mod_path, "w", encoding="utf-8") as f:
                f.write(go_mod_template)
            print(f"go.mod created at {go_mod_path}")
    
        return export_dir
    
    
       
        
    
    
    """def add casulal things 
build ir send it to composer.py """

