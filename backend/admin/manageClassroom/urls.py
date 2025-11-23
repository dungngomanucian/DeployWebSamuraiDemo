# classroom/urls.py
from django.urls import path
from . import views # Giả sử view đặt trong classroom/views.py

urlpatterns = [
    # READ (List) - GET /admin/classrooms/
    path('', views.get_all_classrooms_view, name='admin-classroom-list'),

    # CREATE - POST /admin/classrooms/create/
    path('create/', views.create_classroom_view, name='admin-classroom-create'),

    # READ Active List (for dropdowns) - GET /admin/classrooms/active/
    path('active/', views.get_active_classrooms_view, name='admin-active-classroom-list'),

    # READ (Detail) - GET /admin/classrooms/<classroom_id>/
    path('<str:classroom_id>/', views.get_classroom_by_id_view, name='admin-classroom-detail'),

    # UPDATE - PUT/PATCH /admin/classrooms/<classroom_id>/update/
    path('<str:classroom_id>/update/', views.update_classroom_view, name='admin-classroom-update'),

    # DELETE (Soft Delete) - DELETE /admin/classrooms/<classroom_id>/delete/
    path('<str:classroom_id>/delete/', views.delete_classroom_view, name='admin-classroom-delete'),
]