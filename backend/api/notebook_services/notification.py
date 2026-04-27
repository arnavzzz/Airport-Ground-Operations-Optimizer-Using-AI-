from api.notebook_runtime import execute_notebook_payload


def get_notification_payload():
    return execute_notebook_payload("09_Notification.ipynb")
