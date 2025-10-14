# admin_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response

class DashboardStatsAPIView(APIView):
    # permission_classes = [IsAdminUser] # Bảo vệ endpoint này
    def get(self, request, *args, **kwargs):
        # Giả lập dữ liệu thống kê
        stats = {
            'total_students': 150,
            'active_courses': 12,
            'new_signups_today': 5,
        }
        return Response(stats)