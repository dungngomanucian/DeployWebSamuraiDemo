"""
URL Configuration for Student App
"""
from django.urls import path, include

app_name = 'student'

urlpatterns = [
    # Exam functionality
    path('exam/', include('student.exam.urls')),
    
    # Auth functionality
    path('auth/', include('student.auth.urls')),

    path('register/', include('student.register.urls')),
    
    path('login/', include('student.login.urls')),

    path('dashboard/', include('student.dashboard.urls'))


]

