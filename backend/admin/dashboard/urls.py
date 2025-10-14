# admin_api/urls.py
from django.urls import path
from .views import DashboardStatsAPIView

urlpatterns = [
    path('dashboard/', DashboardStatsAPIView.as_view(), name='dashboard'),
]