# account/urls.py
from django.urls import path
from . import views # Giả sử các view được đặt trong account/views.py

urlpatterns = [
    # READ (List)
    path('', views.get_all_accounts_view, name='admin-account-list'), 

    # CREATE
    path('create/', views.create_account_view, name='admin-account-create'), 

    # READ (Detail)
    path('<str:account_id>/', views.get_account_by_id_view, name='admin-account-detail'), 

    # UPDATE
    path('<str:account_id>/update/', views.update_account_view, name='admin-account-update'), 

    # DELETE (Soft Delete)
    path('<str:account_id>/delete/', views.delete_account_view, name='admin-account-delete'),
]