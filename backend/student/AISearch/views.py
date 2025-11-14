from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import TranslationService

class GeminiTranslateView(APIView):
    def post(self, request, *args, **kwargs):
        # Lấy văn bản cần dịch từ body của request
        text_to_translate = request.data.get('text', '').strip()

        if not text_to_translate:
            return Response(
                {'error': 'Không có văn bản nào được cung cấp để dịch.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Gọi service để thực hiện việc dịch
        result = TranslationService.translate_text(text_to_translate)

        if result['success']:
            # Trả về kết quả dịch nếu thành công
            return Response({'translatedText': result['translatedText']}, status=status.HTTP_200_OK)
        else:
            # Trả về lỗi nếu có vấn đề xảy ra
            return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)