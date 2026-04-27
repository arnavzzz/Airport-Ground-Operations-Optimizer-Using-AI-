from .ai_engine import get_ai_engine_payload
from .analytics import get_analytics_payload
from .command_center import get_command_center_payload
from .equipments import get_equipments_payload
from .flight_operation import get_flight_operation_payload
from .human_resources import get_human_resources_payload
from .infrastructure import get_infrastructure_payload
from .notification import get_notification_payload
from .weather import get_weather_payload


MODULE_SERVICES = {
    "command-center": get_command_center_payload,
    "flight-operations": get_flight_operation_payload,
    "human-resources": get_human_resources_payload,
    "equipments": get_equipments_payload,
    "infrastructure": get_infrastructure_payload,
    "ai-engine": get_ai_engine_payload,
    "analytics": get_analytics_payload,
    "weather": get_weather_payload,
    "notifications": get_notification_payload,
}
