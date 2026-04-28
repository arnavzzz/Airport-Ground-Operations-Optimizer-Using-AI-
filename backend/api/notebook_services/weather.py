import copy
import json
import math
import os
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from api.notebook_runtime import BASE_DIR, execute_notebook_payload


OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
MPS_TO_KT = 1.94384449
_ENV_LOADED = False


def _load_local_env():
    global _ENV_LOADED
    if _ENV_LOADED:
        return

    for env_path in (BASE_DIR / ".env", BASE_DIR / "backend" / ".env"):
        if not env_path.exists():
            continue
        for line in env_path.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in stripped:
                continue
            key, value = stripped.split("=", 1)
            key = key.strip()
            value = value.strip().strip("'\"")
            if key:
                os.environ.setdefault(key, value)

    _ENV_LOADED = True


def _env_float(name):
    value = os.environ.get(name)
    if value in (None, ""):
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _env_timeout():
    try:
        return max(1, float(os.environ.get("OPENWEATHER_TIMEOUT_SECONDS", "2")))
    except ValueError:
        return 2


def _compass(degrees):
    directions = [
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
    ]
    return directions[int((degrees + 11.25) / 22.5) % 16]


def _visibility_category(visibility_m):
    if visibility_m < 800:
        return "LVP"
    if visibility_m < 1500:
        return "IFR"
    if visibility_m < 5000:
        return "MVFR"
    return "VFR"


def _risk_band(score):
    if score >= 75:
        return "critical"
    if score >= 50:
        return "high"
    if score >= 25:
        return "medium"
    return "low"


def _condition_label(raw_weather, clouds_pct):
    main = (raw_weather.get("main") or "").lower()
    description = (raw_weather.get("description") or "").lower()

    if main == "thunderstorm":
        return "Thunderstorm"
    if main in {"mist", "fog", "haze", "smoke", "dust", "sand", "ash"}:
        return "Fog" if main in {"mist", "fog"} else "Haze"
    if main in {"rain", "drizzle"}:
        return "Light Rain"
    if main == "snow":
        return "Snow"
    if main == "clouds":
        if clouds_pct >= 70:
            return "Broken Clouds"
        if clouds_pct >= 25:
            return "Scattered Clouds"
        return "Few Clouds"
    if "fog" in description or "mist" in description:
        return "Fog"
    return "Clear"


def _heading_from_active_end(active_end):
    digits = "".join(char for char in str(active_end or "") if char.isdigit())
    if not digits:
        return None
    return (int(digits) * 10) % 360


def _wind_components(wind_dir_deg, wind_kt, heading_deg):
    if heading_deg is None:
        return {"crosswind_kt": 0, "headwind_kt": 0, "tailwind_kt": 0}

    delta = math.radians(((wind_dir_deg - heading_deg + 180) % 360) - 180)
    crosswind = abs(wind_kt * math.sin(delta))
    along_runway = wind_kt * math.cos(delta)
    return {
        "crosswind_kt": round(crosswind, 1),
        "headwind_kt": round(max(along_runway, 0), 1),
        "tailwind_kt": round(max(-along_runway, 0), 1),
    }


def _severity_score(current):
    visibility_m = current["visibility_m"]
    score = 0
    score += max(0, (5000 - visibility_m) / 5000) * 35
    score += max(0, current["wind_kt"] - 18) * 1.2
    score += max(0, current["gust_kt"] - 25)
    score += current["precip_mm_hr"] * 4
    score += 35 if current["weather_type"] == "Thunderstorm" else 0
    score += 25 if current["weather_type"] == "Fog" else 0
    return round(min(score, 100), 1)


def _fetch_openweather(api_key, lat, lon, timeout):
    query = urlencode(
        {
            "lat": lat,
            "lon": lon,
            "appid": api_key,
            "units": "metric",
        }
    )
    request = Request(
        f"{OPENWEATHER_URL}?{query}",
        headers={
            "Accept": "application/json",
            "User-Agent": "airport-ground-ops-dashboard/1.0",
        },
    )
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _openweather_current(raw, fallback_current):
    weather = (raw.get("weather") or [{}])[0]
    main = raw.get("main") or {}
    wind = raw.get("wind") or {}
    clouds = raw.get("clouds") or {}
    rain = raw.get("rain") or {}
    snow = raw.get("snow") or {}

    wind_dir = int(wind.get("deg") or fallback_current.get("wind_dir_deg") or 0)
    wind_kt = round(float(wind.get("speed") or 0) * MPS_TO_KT, 1)
    gust_kt = round(float(wind.get("gust") or wind.get("speed") or 0) * MPS_TO_KT, 1)
    visibility_m = int(raw.get("visibility") or fallback_current.get("visibility_m") or 10000)
    precip = float(rain.get("1h") or rain.get("3h") or snow.get("1h") or snow.get("3h") or 0)
    condition = _condition_label(weather, int(clouds.get("all") or 0))

    timestamp = datetime.fromtimestamp(raw.get("dt") or datetime.now(tz=timezone.utc).timestamp(), tz=timezone.utc)
    current = {
        **fallback_current,
        "timestamp": timestamp.isoformat(),
        "hour": timestamp.hour,
        "temperature_c": round(float(main.get("temp") or 0), 1),
        "humidity_pct": int(main.get("humidity") or 0),
        "pressure_hpa": int(main.get("pressure") or 0),
        "weather_type": condition,
        "weather_description": weather.get("description") or condition,
        "wind_dir_deg": wind_dir,
        "wind_compass": _compass(wind_dir),
        "wind_kt": wind_kt,
        "gust_kt": gust_kt,
        "visibility_m": visibility_m,
        "cloud_cover_pct": int(clouds.get("all") or 0),
        "precip_mm_hr": round(precip, 1),
        "source": "OpenWeather",
    }
    current["visibility_category"] = _visibility_category(visibility_m)
    current["severity_score"] = _severity_score(current)
    current["risk_band"] = _risk_band(current["severity_score"])
    return current


def _merge_openweather_payload(payload, raw, lat, lon):
    current = _openweather_current(raw, payload.get("current") or {})
    updated = copy.deepcopy(payload)
    updated["current"] = current

    for runway in updated.get("runways", []):
        components = _wind_components(
            current["wind_dir_deg"],
            current["wind_kt"],
            _heading_from_active_end(runway.get("active_end")),
        )
        runway.update(components)
        crosswind_limit = runway.get("crosswind_limit_kt") or 20
        tailwind_limit = runway.get("tailwind_limit_kt") or 10
        penalty = max(0, components["crosswind_kt"] - crosswind_limit) * 4
        penalty += max(0, components["tailwind_kt"] - tailwind_limit) * 6
        penalty += 18 if current["weather_type"] == "Thunderstorm" else 0
        penalty += 12 if current["visibility_m"] < 1500 else 0
        runway["suitability_score"] = round(max(0, 100 - penalty), 1)
        runway["status"] = "restricted" if runway["suitability_score"] < 75 else "open"

    preferred = max(updated.get("runways", []), key=lambda item: item.get("suitability_score", 0), default={})
    updated["airport"] = {
        **(updated.get("airport") or {}),
        "lat": lat,
        "lon": lon,
    }
    updated["kpis"] = {
        **(updated.get("kpis") or {}),
        "condition": current["weather_type"],
        "temperature_c": current["temperature_c"],
        "wind_kt": current["wind_kt"],
        "gust_kt": current["gust_kt"],
        "wind_direction": f"{current['wind_dir_deg']} deg {current['wind_compass']}",
        "crosswind_kt": preferred.get("crosswind_kt", current.get("crosswind_kt", 0)),
        "tailwind_kt": preferred.get("tailwind_kt", current.get("tailwind_kt", 0)),
        "preferred_runway": preferred.get("runway"),
        "preferred_runway_score": preferred.get("suitability_score"),
        "visibility_m": current["visibility_m"],
        "visibility_category": current["visibility_category"],
        "risk_score": current["severity_score"],
        "risk_band": current["risk_band"],
        "weather_source": "OpenWeather",
    }
    updated["weather_source"] = {
        "provider": "OpenWeather",
        "status": "live",
        "location": raw.get("name"),
        "lat": lat,
        "lon": lon,
    }
    return updated


def get_weather_payload():
    payload = execute_notebook_payload("08_Weather.ipynb")
    _load_local_env()

    api_key = os.environ.get("OPENWEATHER_API_KEY")
    airport = payload.get("airport") or {}
    lat = _env_float("OPENWEATHER_LAT") or airport.get("lat")
    lon = _env_float("OPENWEATHER_LON") or airport.get("lon")

    if not api_key or lat is None or lon is None:
        return {
            **payload,
            "weather_source": {
                "provider": "notebook",
                "status": "missing_openweather_config",
            },
        }

    try:
        raw = _fetch_openweather(api_key, lat, lon, _env_timeout())
    except (HTTPError, TimeoutError, URLError, OSError, ValueError):
        return {
            **payload,
            "weather_source": {
                "provider": "notebook",
                "status": "openweather_unavailable",
            },
        }

    return _merge_openweather_payload(payload, raw, lat, lon)
