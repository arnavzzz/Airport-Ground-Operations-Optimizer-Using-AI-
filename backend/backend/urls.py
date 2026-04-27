from django.contrib import admin
from django.urls import include, path

from api import views as api_views


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("", api_views.api_index),
    path("test/", api_views.test_connection),
    path("command-center/", api_views.command_center),
    path("flight-operations/", api_views.flight_operations),
    path("human-resources/", api_views.human_resources),
    path("equipments/", api_views.equipments),
    path("infrastructure/", api_views.infrastructure),
    path("ai-engine/", api_views.ai_engine),
    path("analytics/", api_views.analytics),
    path("weather/", api_views.weather),
    path("notifications/", api_views.notifications),
    path("flights/", api_views.live_flights),
    path("predict/", api_views.predict),
]
