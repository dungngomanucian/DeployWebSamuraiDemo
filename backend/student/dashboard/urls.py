# backend/student/dashboard/urls.py

from django.urls import path
from .views import OnboardingAPIView
# (Sau này bạn sẽ import thêm DashboardDataAPIView vào đây)

urlpatterns = [
    # URL này sẽ khớp với: /api/v1/student/dashboard/onboarding/
    path('onboarding/', OnboardingAPIView.as_view(), name='dashboard-onboarding'),
    
    # (Sau này bạn sẽ thêm path cho dashboard chính, ví dụ:)
    # path('', DashboardDataAPIView.as_view(), name='dashboard-data'),
]