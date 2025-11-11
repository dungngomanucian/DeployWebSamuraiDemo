# results/services.py (Tệp mới)

from config.supabase_client import supabase # Giả định import từ đây
from typing import Dict, List, Optional

class ResultService:
    """
    Service xử lý nghiệp vụ cho 'results'
    """
    
    @staticmethod
    def get_exam_history_by_student(student_id: str) -> Dict:
        """
        Lấy lịch sử bài làm (exam_results) của một học sinh.
        JOIN với jlpt_exams và levels để lấy tên.
        """
        try:
            # Truy vấn Supabase:
            # 1. Chọn từ bảng 'exam_results'
            # 2. Lọc (filter) theo 'student_id'
            # 3. JOIN với bảng 'jlpt_exams' (lấy id, title)
            # 4. Từ 'jlpt_exams', JOIN tiếp với 'levels' (lấy id, title)
            # 5. Sắp xếp theo 'datetime' (bài làm mới nhất lên đầu)
            
            response = supabase.table('exam_results')\
                .select('''
                    id, 
                    sum_score, 
                    duration, 
                    datetime,
                    exam:jlpt_exams (
                        id, 
                        title,
                        level:levels (id, title)
                    )
                ''')\
                .eq('student_id', student_id)\
                .order('datetime', desc=True)\
                .execute()
            
            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            print(f"Lỗi khi lấy lịch sử bài làm: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }