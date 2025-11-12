import os
import google.generativeai as genai
from typing import Dict
import json

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
        Gửi văn bản đến Gemini để phân tích và trả về kết quả dưới dạng JSON.
        """
        try:
            TranslationService.configure_gemini()
            
            # 1. Tách riêng System Prompt để "dạy" model vai trò và quy tắc
            system_prompt = """Nhiệm vụ: Bạn là một chuyên gia phân tích ngôn ngữ Nhật-Việt. Hãy phân tích văn bản tiếng Nhật được cung cấp và trả về CHỈ một đối tượng JSON.
            
Nếu đầu vào là câu dài, dùng cấu trúc: {{"type": "sentence", "translation": "[Bản dịch tiếng Việt]"}}

Nếu đầu vào là từ ngắn (Kanji/từ vựng/ngữ pháp ngắn), dùng cấu trúc: {{"type": "word", "kanji": "[Kanji]", "reading": "[Cách đọc Hiragana/Katakana]", "sino_vietnamese": "[Hán-Việt]", "meaning": "[Nghĩa tiếng Việt]", "usage": "[Giải thích cách dùng/ví dụ từ vựng. Nếu không có, dùng null]", "grammar": "[Giải thích cấu trúc ngữ pháp đặc biệt nếu có. Nếu không, dùng null]"}}

QUY TẮC TUYỆT ĐỐI: Không thêm bất kỳ giải thích, lời chào, hay văn bản nào khác ngoài đối tượng JSON được yêu cầu."""

           

            model = genai.GenerativeModel(
                'gemini-2.5-flash-lite',
                system_instruction=system_prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            # 3. Prompt chính giờ chỉ cần chứa nội dung cần phân tích
            response = model.generate_content(text_to_translate)
            
            # 4. Không cần làm sạch nữa, parse trực tiếp vì đã có JSON mode
            json_data = json.loads(response.text)
            
            # Trả về dữ liệu JSON đã được parse
            return {'success': True, 'translatedText': json_data}

        except Exception as e:
            # Ghi lại lỗi để debug
            print(f"Lỗi khi gọi Gemini API: {str(e)}")
            return {'success': False, 'error': 'Không thể dịch văn bản vào lúc này.'}