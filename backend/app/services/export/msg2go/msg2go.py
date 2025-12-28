from ...utils.msg_serializer import MsgSerializer
import os


dir_export == ""

class Run:
    def __init__(self,pid):
        self.pid = pid
    @staticmethod
    def get_storage_root():
        """Compute storage root inside app context."""
        return os.path.abspath(
            os.path.join(current_app.root_path, "..", "storage/projects")
        )
    def get_src(pid, **kwargs):
        storage_root = ProjectService.get_storage_root()

        proj_dir = os.path.join(storage_root, str(self.pid), "autosave")

        relation_dir = os.path.join(proj_dir, "relation")
        ui_dir = os.path.join(proj_dir, "ui")
        ui_main_path = os.path.join(ui_dir, "main.msgpack")
        relation_main_path = os.path.join(relation_dir, "main.msgpack")
        ui = MsgSerializer(ui_main_path)._load()
        relation = MsgSerializer(relation_main_path)._load()
        return ui, relation
    
    def build_ir():
        """build Intermediate Representation."""
        pass
    def call_composer(build_ir):
        pass

    def write_the_result_of_composer():
        pass
    
    """def add casulal things 
build ir send it to composer.py """
test = Run()
ui,relation = test.get_src("Pld4z9a")
print(ui)
