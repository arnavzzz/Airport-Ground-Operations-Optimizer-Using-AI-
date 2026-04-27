from api.notebook_runtime import execute_notebook_payload


def get_ai_engine_payload():
    return execute_notebook_payload("06_AI_Engine.ipynb")
