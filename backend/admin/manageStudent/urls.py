"""
URL patterns for student management in admin panel
"""
from django.urls import path
from . import views

urlpatterns = [
    # List and create students
    path('', views.get_all_students, name='admin-student-list'),
    path('create/', views.create_student, name='admin-student-create'),
    path('get-classrooms-active/', views.get_active_classrooms_view, name='admin-active-classroom-list'),
    
    # Individual student operations
    path('<str:student_id>/', views.get_student_by_id, name='admin-student-detail'),
    path('<str:student_id>/update/', views.update_student, name='admin-student-update'),
    path('<str:student_id>/delete/', views.delete_student, name='admin-student-delete'),

    # Filtering
    path('filter/', views.filter_students, name='admin-student-filter'),
    
]