"""
URL Configuration for Student App
"""
from django.urls import path
from . import views

app_name = 'student'

urlpatterns = [
    # Levels
    path('levels/', views.get_levels, name='levels'),
    
    # Exams
    path('exams/<str:exam_id>/', views.get_exam_by_id, name='exam-detail'),
    path('exams/level/<str:level_id>/', views.get_exams_by_level, name='exams-by-level'),
    path('exams/<str:exam_id>/full/', views.get_full_exam_data, name='exam-full-data'),
    
    # Results
    path('results/', views.save_exam_result, name='save-result'),
    path('answers/', views.save_student_answers, name='save-answers'),
]

