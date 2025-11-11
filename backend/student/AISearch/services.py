import os
import google.generativeai as genai
from typing import Dict

class TranslationService:
    """
    Service để xử lý việc dịch văn bản sử dụng Google Gemini API.
    """
    
    @staticmethod
    def configure_gemini():
        """
        Cấu hình Gemini API key từ biến môi trường.
        Nên gọi hàm này một lần khi ứng dụng khởi động nếu có thể,
        hoặc gọi trước mỗi lần sử dụng để đảm bảo an toàn.
        """
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY không được thiết lập trong môi trường.")
        genai.configure(api_key=api_key)

    @staticmethod
    def translate_text(text_to_translate: str) -> Dict:
        """
        Gửi văn bản đến Gemini để dịch sang tiếng Việt.
        """
        try:
            TranslationService.configure_gemini()
            
            # Chọn model, 'gemini-2.5-flash-lite' là một lựa chọn tốt cho các tác vụ văn bản
            model = genai.GenerativeModel('gemini-2.5-flash-lite')
            
            # Tạo prompt rõ ràng để Gemini chỉ trả về kết quả dịch
            prompt = f"Hãy dịch đoạn văn bản sau sang tiếng Anh . Chỉ trả về duy nhất phần văn bản đã được dịch, không thêm bất kỳ lời dẫn  nào. Đoạn văn bản cần dịch là: '{text_to_translate}'"
            
            response = model.generate_content(prompt)
            
            # Trả về kết quả dưới dạng dictionary mà frontend mong đợi
            return {'success': True, 'translatedText': response.text}

        except Exception as e:
            # Ghi lại lỗi để debug
            print(f"Lỗi khi gọi Gemini API: {str(e)}")
            return {'success': False, 'error': 'Không thể dịch văn bản vào lúc này.'}