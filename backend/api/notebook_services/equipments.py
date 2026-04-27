from api.notebook_runtime import execute_notebook_payload


def get_equipments_payload():
    return execute_notebook_payload("04_Equipments.ipynb")
