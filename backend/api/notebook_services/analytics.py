from api.notebook_runtime import execute_notebook_payload


def get_analytics_payload():
    return execute_notebook_payload("07_Analytics.ipynb")
