# course/urls.py
from django.urls import path
from . import views # Giả sử view đặt trong course/views.py

urlpatterns = [
    # READ (List) - GET /admin/courses/
    path('', views.get_all_courses_view, name='admin-course-list'),

    # CREATE - POST /admin/courses/create/
    path('create/', views.create_course_view, name='admin-course-create'),

    # READ (Detail) - GET /admin/courses/<course_id>/
    path('<str:course_id>/', views.get_course_by_id_view, name='admin-course-detail'),

    # UPDATE - PUT/PATCH /admin/courses/<course_id>/update/
    path('<str:course_id>/update/', views.update_course_view, name='admin-course-update'),

    # DELETE (Soft Delete) - DELETE /admin/courses/<course_id>/delete/
    path('<str:course_id>/delete/', views.delete_course_view, name='admin-course-delete'),
]