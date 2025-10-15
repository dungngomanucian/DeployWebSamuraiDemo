# backend/admin/urls.py
from django.urls import path, include

# Đây là nơi bạn định tuyến cho các app con trong 'admin'
urlpatterns = [
    # Bất kỳ URL nào bắt đầu bằng /dashboard/ sẽ được chuyển đến dashboard.urls
    path('dashboard/', include('admin.dashboard.urls')),

    # Bất kỳ URL nào bắt đầu bằng /test/ sẽ được chuyển đến test.urls
    path('test/', include('admin.test.urls')),
]