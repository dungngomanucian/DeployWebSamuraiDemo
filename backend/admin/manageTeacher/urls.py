# teacher/urls.py
from django.urls import path
from . import views # Giả sử view đặt trong teacher/views.py

urlpatterns = [
    # READ (List) - GET /admin/teachers/
    path('', views.get_all_teachers_view, name='admin-teacher-list'),

    # CREATE - POST /admin/teachers/create/
    path('create/', views.create_teacher_view, name='admin-teacher-create'),

    # READ (Detail) - GET /admin/teachers/<teacher_id>/
    path('<str:teacher_id>/', views.get_teacher_by_id_view, name='admin-teacher-detail'),

    # UPDATE - PUT/PATCH /admin/teachers/<teacher_id>/update/
    path('<str:teacher_id>/update/', views.update_teacher_view, name='admin-teacher-update'),

    # DELETE (Soft Delete) - DELETE /admin/teachers/<teacher_id>/delete/
    path('<str:teacher_id>/delete/', views.delete_teacher_view, name='admin-teacher-delete'),
]