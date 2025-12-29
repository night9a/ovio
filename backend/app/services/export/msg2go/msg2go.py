from ....utils.msg_serializer import MsgSerializer
from ...project_service import ProjectService
import os
import composer
#import roller


#dir_export == ""

class Run:
    def __init__(self,pid):
        self.pid = pid
    @staticmethod
    def get_storage_root():
        """Compute storage root inside app context."""
        return os.path.abspath(
            os.path.join(current_app.root_path, "..", "storage/projects")
        )
    def get_src(self, **kwargs):
        storage_root = ProjectService.get_storage_root()

        proj_dir = os.path.join(storage_root, str(self.pid), "autosave")

        relation_dir = os.path.join(proj_dir, "relation")
        ui_dir = os.path.join(proj_dir, "ui")
        ui_main_path = os.path.join(ui_dir, "main.msgpack")
        relation_main_path = os.path.join(relation_dir, "main.msgpack")
        ui = MsgSerializer(ui_main_path)._load()
        relation = MsgSerializer(relation_main_path)._load()
        return ui, relation
    
    def call_composer(self):
        ui,_ = get_src()
        result = composer(ui)
        return result
    def call_roller(self):
        _,relation = get_src()
        result = composer(relation)
        return result
    def call_modular(self):
        pass
    def call_pluger(self):
        pass
    def run():
        r = call_composer
        os write (r)
        call roller()
        os write (r)
        #call_modular()
        #call_pluger()
        
    
    
    """def add casulal things 
build ir send it to composer.py """

