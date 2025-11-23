# exam/urls.py
from django.urls import path
from . import views # Giả sử view đặt trong exam/views.py

urlpatterns = [
    # READ (List) - GET /admin/exams/
    path('', views.get_all_exams_view, name='admin-exam-list'),

    # CREATE - POST /admin/exams/create/
    path('create/', views.create_exam_view, name='admin-exam-create'),

    # READ (Detail) - GET /admin/exams/<exam_id>/
    path('<str:exam_id>/', views.get_exam_by_id_view, name='admin-exam-detail'),

    # UPDATE - PUT/PATCH /admin/exams/<exam_id>/update/
    path('<str:exam_id>/update/', views.update_exam_view, name='admin-exam-update'),

    # DELETE (Soft Delete) - DELETE /admin/exams/<exam_id>/delete/
    path('<str:exam_id>/delete/', views.delete_exam_view, name='admin-exam-delete'),
]