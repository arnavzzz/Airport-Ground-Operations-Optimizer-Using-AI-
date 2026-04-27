from django.urls import path

from . import views

urlpatterns = [
    path('test/', views.test_connection, name='test-connection'),
    path('flights/', views.live_flights, name='live-flights'),
    path('predict/', views.predict, name='predict'),
]
