# exam-result/urls.py (Tệp mới)

from django.urls import path
from . import views  # Chúng ta sẽ tạo views ở bước sau

urlpatterns = [
    path('history/', views.get_exam_history, name='get-exam-history'),
    path('<int:exam_result_id>/', views.get_exam_result_detail, name='get-exam-result-detail'),
]