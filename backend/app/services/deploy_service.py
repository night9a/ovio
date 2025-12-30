from .export.msg2go import msg2go

class DeployError():
    pass

class DeployService:
    @staticmethod
    def deploy_project(pid,data):
        """
        Build and export Go source for a project.
        Returns path to generated main.go
        """
        runner = msg2go.Run(pid)
        result_path = runner.run()
        return result_path

