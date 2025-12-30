import os
from flask import current_app

from ....utils.msg_serializer import MsgSerializer
from ...project_service import ProjectService
from .composer import Composer


class Run:
    def __init__(self, pid):
        self.pid = pid

    # -------------------------
    # Paths
    # -------------------------

    def get_project_dirs(self):
        storage_root = ProjectService.get_storage_root()

        proj_dir = os.path.join(storage_root, str(self.pid), "autosave")
        ui_dir = os.path.join(proj_dir, "ui")
        relation_dir = os.path.join(proj_dir, "relation")

        export_dir = os.path.join(
            storage_root, str(self.pid), "export"
        )

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
    # Composer
    # -------------------------

    def call_composer(self) -> str:
        ui, _ = self.get_src()
        comp = Composer(ui)
        return comp.build()

    # -------------------------
    # Runner
    # -------------------------

    def run(self):
        """
        Build UI → write main.go to export directory
        """
        go_code = self.call_composer()

        dirs = self.get_project_dirs()
        export_dir = dirs["export"]
        os.makedirs(export_dir, exist_ok=True)

        main_go_path = os.path.join(export_dir, "main.go")

        with open(main_go_path, "w", encoding="utf-8") as f:
            f.write(go_code)

        return main_go_path

        #call_modular()
        #call_pluger()
        
    
    
    """def add casulal things 
build ir send it to composer.py """

