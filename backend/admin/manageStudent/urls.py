"""
URL patterns for student management in admin panel
"""
from django.urls import path
from . import views

urlpatterns = [
    # List and create students
    path('', views.get_all_students, name='admin-student-list'),
    path('create/', views.create_student, name='admin-student-create'),
    
    # Individual student operations
    path('<str:student_id>/', views.get_student_by_id, name='admin-student-detail'),
    path('<str:student_id>/update/', views.update_student, name='admin-student-update'),
    path('<str:student_id>/delete/', views.delete_student, name='admin-student-delete'),
    
    # Student related data
    path('<str:student_id>/exam-history/', views.get_student_exam_history, name='admin-student-exam-history'),
    path('<str:student_id>/progress/', views.get_student_progress, name='admin-student-progress'),
    
    # Filtering
    path('filter/', views.filter_students, name='admin-student-filter'),
]