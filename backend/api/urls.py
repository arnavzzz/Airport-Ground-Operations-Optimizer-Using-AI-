from django.urls import path

from . import views

urlpatterns = [
    path("", views.api_index, name="api-index"),
    path("test/", views.test_connection, name="test-connection"),
    path("command-center/", views.command_center, name="command-center"),
    path("flight-operations/", views.flight_operations, name="flight-operations"),
    path("human-resources/", views.human_resources, name="human-resources"),
    path("equipments/", views.equipments, name="equipments"),
    path("infrastructure/", views.infrastructure, name="infrastructure"),
    path("ai-engine/", views.ai_engine, name="ai-engine"),
    path("analytics/", views.analytics, name="analytics"),
    path("weather/", views.weather, name="weather"),
    path("notifications/", views.notifications, name="notifications"),
    path("flights/", views.live_flights, name="live-flights"),
    path("predict/", views.predict, name="predict"),
]
