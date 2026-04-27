from rest_framework.decorators import api_view
from rest_framework.response import Response

from .notebook_runtime import NotebookExecutionError, clear_notebook_cache
from .notebook_services import MODULE_SERVICES


def _module_response(module_key, request):
    if request.query_params.get("refresh") == "1":
        clear_notebook_cache()
    try:
        payload = MODULE_SERVICES[module_key]()
    except NotebookExecutionError as exc:
        return Response(
            {
                "status": "error",
                "module": module_key,
                "message": str(exc),
            },
            status=500,
        )

    return Response(
        {
            "status": "ok",
            "module": module_key,
            "data": payload,
        }
    )


@api_view(["GET"])
def test_connection(request):
    return Response(
        {
            "status": "connected",
            "message": "Django is talking to React!",
            "modules": list(MODULE_SERVICES.keys()),
        }
    )


@api_view(["GET"])
def api_index(request):
    return Response(
        {
            "status": "ok",
            "count": len(MODULE_SERVICES),
            "modules": [
                {
                    "slug": slug,
                    "endpoint": f"/api/{slug}/",
                }
                for slug in MODULE_SERVICES
            ],
        }
    )


@api_view(["GET"])
def command_center(request):
    return _module_response("command-center", request)


@api_view(["GET"])
def flight_operations(request):
    return _module_response("flight-operations", request)


@api_view(["GET"])
def human_resources(request):
    return _module_response("human-resources", request)


@api_view(["GET"])
def equipments(request):
    return _module_response("equipments", request)


@api_view(["GET"])
def infrastructure(request):
    return _module_response("infrastructure", request)


@api_view(["GET", "POST"])
def ai_engine(request):
    return _module_response("ai-engine", request)


@api_view(["GET"])
def analytics(request):
    return _module_response("analytics", request)


@api_view(["GET"])
def weather(request):
    return _module_response("weather", request)


@api_view(["GET"])
def notifications(request):
    return _module_response("notifications", request)


@api_view(["GET"])
def live_flights(request):
    return _module_response("flight-operations", request)


@api_view(["POST"])
def predict(request):
    return _module_response("ai-engine", request)
