# level/urls.py
from django.urls import path
from . import views # Giả sử view đặt trong level/views.py

urlpatterns = [
    # READ (List) - GET /admin/levels/
    path('', views.get_all_levels_view, name='admin-level-list'),

    # CREATE - POST /admin/levels/create/
    path('create/', views.create_level_view, name='admin-level-create'),

    # READ (Detail) - GET /admin/levels/<level_id>/
    path('<str:level_id>/', views.get_level_by_id_view, name='admin-level-detail'),

    # UPDATE - PUT/PATCH /admin/levels/<level_id>/update/
    path('<str:level_id>/update/', views.update_level_view, name='admin-level-update'),

    # DELETE (Soft Delete) - DELETE /admin/levels/<level_id>/delete/
    path('<str:level_id>/delete/', views.delete_level_view, name='admin-level-delete'),
]