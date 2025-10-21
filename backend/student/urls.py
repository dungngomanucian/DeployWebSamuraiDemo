# backend/student/urls.py

from django.urls import path, include

urlpatterns = [
    # Bất kỳ URL nào bắt đầu bằng 'dashboard/' 
    # sẽ được chuyển tiếp đến file 'student.dashboard.urls'
    path('dashboard/', include('student.dashboard.urls')),
    
    # (Sau này nếu có chức năng profile, bạn sẽ thêm:)
    # path('profile/', include('student.profile.urls')),
]