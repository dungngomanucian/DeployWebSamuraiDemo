# backend/admin/urls.py
from django.urls import path, include

urlpatterns = [
    path('dashboard/', include('admin.dashboard.urls')),
    path('student/', include('admin.manageStudent.urls')),
]