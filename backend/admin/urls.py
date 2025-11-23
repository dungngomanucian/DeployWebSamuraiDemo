# backend/admin/urls.py
from django.urls import path, include

urlpatterns = [
    path('auth/', include('admin.auth.urls')),
    path('dashboard/', include('admin.dashboard.urls')),
    path('student/', include('admin.manageStudent.urls')),
    path('account/',include('admin.manageAccount.urls')),
    path('teacher/',include('admin.manageTeacher.urls')),
    path('jlpt-exam/',include('admin.manageJlptExam.urls')),
    path('course/',include('admin.manageCourse.urls')),
    path('classroom/',include('admin.manageClassroom.urls')),
    path('level/',include('admin.manageLevel.urls')),
]