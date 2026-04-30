import json
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"
STATIC_API_DIR = PROJECT_ROOT / "frontend" / "public" / "api"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from api.notebook_services import MODULE_SERVICES  # noqa: E402


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def build_api_index():
    return {
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


def build_test_payload():
    return {
        "status": "connected",
        "message": "Netlify is serving prebuilt notebook API payloads.",
        "modules": list(MODULE_SERVICES.keys()),
    }


def build_module_response(module_key, payload):
    return {
        "status": "ok",
        "module": module_key,
        "data": payload,
    }


def export_static_api():
    module_payloads = {slug: service() for slug, service in MODULE_SERVICES.items()}

    write_json(STATIC_API_DIR / "index.json", build_api_index())
    write_json(STATIC_API_DIR / "test.json", build_test_payload())

    for slug, payload in module_payloads.items():
        write_json(STATIC_API_DIR / f"{slug}.json", build_module_response(slug, payload))

    write_json(
        STATIC_API_DIR / "flights.json",
        build_module_response("flight-operations", module_payloads["flight-operations"]),
    )
    write_json(
        STATIC_API_DIR / "predict.json",
        build_module_response("ai-engine", module_payloads["ai-engine"]),
    )

    print(f"Exported {len(module_payloads) + 4} static API files to {STATIC_API_DIR}")


if __name__ == "__main__":
    export_static_api()
