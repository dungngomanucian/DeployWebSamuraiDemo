
from django.urls import path, include
# ... các import khác
from .views import GeminiTranslateView # 

urlpatterns = [
    # ... các URL patterns hiện có của bạn
    
    # 🌟 ĐĂNG KÝ URL MỚI CHO CHỨC NĂNG DỊCH 
    path('translategemini/', GeminiTranslateView.as_view(), name='translate-gemini'),
]