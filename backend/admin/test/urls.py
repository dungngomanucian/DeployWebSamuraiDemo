# backend/admin/test/urls.py
from django.urls import path
from . import views

# urlpatterns định nghĩa các URL riêng của app 'test'
urlpatterns = [
    # Ví dụ: một URL để lấy dữ liệu test
    # Nó sẽ được truy cập qua /api/admin/test/get-data/ (xem bước 2)
    path('get-data/', views.get_test_data, name='get-all-admin'), 
]