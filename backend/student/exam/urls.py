"""
URL patterns for exam functionality
"""
from django.urls import path
from . import views

urlpatterns = [
    path('levels/', views.get_levels, name='exam-levels'),
    path('exams/<str:exam_id>/', views.get_exam_by_id, name='exam-detail'),
    path('exams/<str:level_id>/list/', views.get_exams_by_level, name='exam-list-by-level'),
    path('exams/<str:exam_id>/full_data/', views.get_full_exam_data, name='exam-full-data'),
    path('results/', views.save_exam_result, name='save-exam-result'),
    path('answers/', views.save_student_answers, name='save-student-answers'),
]
