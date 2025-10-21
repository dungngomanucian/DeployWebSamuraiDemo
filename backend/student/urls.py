"""
URL Configuration for Student App
"""
from django.urls import path, include

app_name = 'student'

urlpatterns = [
    # Exam functionality
    path('exam/', include('student.exam.urls')),
    
    # Auth functionality (to be added)
    # path('auth/', include('student.auth.urls')),
    
    # Profile functionality (to be added)
    # path('profile/', include('student.profile.urls')),
]

