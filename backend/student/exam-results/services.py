# results/services.py (Tệp mới)

from config.supabase_client import supabase # Giả định import từ đây
from typing import Dict, List, Optional

# === IMPORT TỪ APP 'exam' ===
# Chúng ta cần tái sử dụng service của 'exam' để lấy đề thi gốc
try:
    from exam.services import ExamService
except ImportError:
    from ..exam.services import ExamService

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
    
    @staticmethod
    def get_result_detail(student_id: str, exam_result_id: int) -> Dict:
        """
        Lấy chi tiết bài làm (review) và gộp với đề thi gốc.
        """
        try:
            # 1. XÁC MINH QUYỀN SỞ HỮU (Verify Ownership)
            # Kiểm tra xem exam_result_id có tồn tại VÀ thuộc student_id này không
            result_meta_res = supabase.table('exam_results')\
                .select('id, exam_id, sum_score, duration, datetime')\
                .eq('id', exam_result_id)\
                .eq('student_id', student_id)\
                .single()\
                .execute()

            if not result_meta_res.data:
                # Không tìm thấy hoặc không có quyền
                return {'success': False, 'error': 'Không tìm thấy kết quả bài làm'}
            
            result_metadata = result_meta_res.data
            exam_id = result_metadata['exam_id'] # Lấy ID của đề thi gốc

            # 2. LẤY BÀI LÀM CỦA HỌC SINH (Student's Submission)
            # Lấy tất cả câu trả lời đã lưu của bài làm này
            student_answers_res = supabase.table('save_answers')\
                .select('exam_question_id, chosen_answer_id')\
                .eq('exam_result_id', exam_result_id)\
                .execute()
            
            # Chuyển từ List sang Map (Dictionary) để tra cứu nhanh (O(1))
            # student_answers_map = {"Q1_ID": "Ans_B", "Q2_ID": "Ans_C", ...}
            student_answers_map = {
                ans['exam_question_id']: ans['chosen_answer_id'] 
                for ans in student_answers_res.data
            }
            
            # 3. LẤY ĐỀ THI GỐC (Exam Template)
            # Tái sử dụng hàm get_full_exam_data từ ExamService
            exam_data_result = ExamService.get_full_exam_data(exam_id)
            
            if not exam_data_result['success']:
                # Nếu đề thi gốc bị lỗi (ví dụ: đã bị xóa), báo lỗi
                return {'success': False, 'error': 'Không thể tải được đề thi gốc'}
            
            exam_content = exam_data_result['data'] # Đây là dictionary lồng nhau khổng lồ

            # 4. KẾT HỢP (Merge) DỮ LIỆU
            # Lặp qua đề thi gốc và "đánh dấu" các câu trả lời của học sinh
            
            for section in exam_content.get('sections', []):
                for qt in section.get('question_types', []):
                    for question in qt.get('questions', []):
                        q_id = question.get('id')
                        
                        # Lấy câu trả lời học sinh chọn từ map
                        chosen_id = student_answers_map.get(q_id)
                        
                        # Thêm trường mới vào
                        question['student_chosen_answer_id'] = chosen_id
                        
                        # Lặp qua các đáp án (A, B, C, D) của câu hỏi này
                        for answer in question.get('answers', []):
                            a_id = answer.get('id')
                            
                            # (answer['is_correct'] đã có sẵn từ get_full_exam_data)
                            
                            # Thêm trường mới để báo cho Frontend biết
                            answer['is_student_choice'] = (a_id == chosen_id)

            # 5. ĐÓNG GÓI DỮ LIỆU TRẢ VỀ
            final_data = {
                'result_info': result_metadata, # Thông tin (điểm, thời gian)
                'exam_content': exam_content    # Toàn bộ đề thi đã "đánh dấu"
            }
            
            return {
                'success': True,
                'data': final_data
            }

        except Exception as e:
            print(f"Lỗi nghiêm trọng trong get_result_detail: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }