# backend/student/dashboard/urls.py

from django.urls import path
from .views import OnboardingAPIView, TopBarProfileAPIView, DashboardGridAPIView
# (Sau này bạn sẽ import thêm DashboardDataAPIView vào đây)

urlpatterns = [
    # URL: /api/v1/student/dashboard/onboarding/
    path('onboarding/', OnboardingAPIView.as_view(), name='dashboard-onboarding'),
    path('profile/', TopBarProfileAPIView.as_view(), name='dashboard-profile'),
    path('main/', DashboardGridAPIView.as_view(), name='dashboard-main-data')
    
]