from api.notebook_runtime import execute_notebook_payload


def get_flight_operation_payload():
    return execute_notebook_payload("02_Flight_Operation.ipynb")
