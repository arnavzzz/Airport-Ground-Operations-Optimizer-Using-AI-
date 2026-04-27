from api.notebook_runtime import execute_notebook_payload


def get_infrastructure_payload():
    return execute_notebook_payload("05_Infrastructure.ipynb")
