from api.notebook_runtime import execute_notebook_payload


def get_human_resources_payload():
    return execute_notebook_payload("03_Human_Resources.ipynb")
