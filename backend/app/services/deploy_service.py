from .export.msg2go import msg2go
from .export.build import build

class DeployError(Exception):
    pass

class DeployService:
    @staticmethod
    def deploy_project(pid,data):
        """
        Build and export Go source for a project.
        Returns path to generated main.go
        """
        target_arch = data['target_arch']
        runner = msg2go.Run(pid)
        result_path = runner.run()
        if target_arch == "web":
            exec_path = build("web",result_path) 
        if target_arch == "mobile":
            exec_path = build("mobile",result_path)
        if target_arch == "desktop":
            exec_path = build("desktop",result_path)
        return exec_path

