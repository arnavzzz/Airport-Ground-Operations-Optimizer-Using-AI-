import mimetypes

from django.conf import settings
from django.http import FileResponse, JsonResponse


def _frontend_file_response(file_path, content_type=None):
    detected_type, _ = mimetypes.guess_type(file_path.name)
    return FileResponse(
        file_path.open("rb"),
        content_type=content_type or detected_type or "application/octet-stream",
    )


def frontend_app(request, path=""):
    dist_root = settings.FRONTEND_DIST_DIR.resolve()
    index_path = dist_root / "index.html"

    if path:
        try:
            asset_path = (dist_root / path).resolve()
        except (OSError, RuntimeError, ValueError):
            asset_path = None

        if asset_path and asset_path.is_relative_to(dist_root) and asset_path.is_file():
            return _frontend_file_response(asset_path)

    if index_path.is_file():
        return _frontend_file_response(index_path, content_type="text/html")

    return JsonResponse(
        {
            "status": "frontend-not-built",
            "message": "Run `npm run build` inside the frontend folder, then start Django again.",
            "api": "/api/",
        },
        status=503,
    )
