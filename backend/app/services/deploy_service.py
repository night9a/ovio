import os

current_directory = os.getcwd()
print(current_directory)


from .export.msg2go import msg2go

class DeployError():
    pass

class DeployService():
    @staticmethod
    def deploy_project(pid):
        test = msg2go.Run(pid)
        ui,relation = test.get_src()
        return ui
        
    
