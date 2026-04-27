from api.notebook_runtime import execute_notebook_payload


def get_command_center_payload():
    return execute_notebook_payload("01_Command_Center.ipynb")
