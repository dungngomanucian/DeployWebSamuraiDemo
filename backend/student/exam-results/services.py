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
        (ĐÃ CẬP NHẬT để xử lý câu hỏi sắp xếp)
        """
        try:
            # 1. XÁC MINH QUYỀN SỞ HỮU (Giữ nguyên)
            result_meta_res = supabase.table('exam_results')\
                .select('id, exam_id, sum_score, duration, datetime')\
                .eq('id', exam_result_id)\
                .eq('student_id', student_id)\
                .single()\
                .execute()

            if not result_meta_res.data:
                return {'success': False, 'error': 'Không tìm thấy kết quả bài làm'}
            
            result_metadata = result_meta_res.data
            exam_id = result_metadata['exam_id']

            # 2. LẤY ĐỀ THI GỐC (Lấy trước)
            exam_data_result = ExamService.get_full_exam_data(exam_id)
            
            if not exam_data_result['success']:
                return {'success': False, 'error': 'Không thể tải được đề thi gốc'}
            
            exam_content = exam_data_result['data']

            # 3. TẠO MAP CÂU HỎI SẮP XẾP
            question_type_map = {}
            for section in exam_content.get('sections', []):
                for qt in section.get('question_types', []):
                    
                    # === ĐÂY LÀ DÒNG ĐÃ SỬA ===
                    is_sort = qt.get('is_Sort_Question', False) 
                    # ==========================
                    
                    for question in qt.get('questions', []):
                        if question: 
                           question_type_map[question.get('id')] = is_sort

            # 4. LẤY BÀI LÀM (Sắp xếp theo 'position')
            student_answers_res = supabase.table('save_answers')\
                .select('exam_question_id, chosen_answer_id, position')\
                .eq('exam_result_id', exam_result_id)\
                .order('position', desc=False)\
                .execute()
            
            # 5. XỬ LÝ BÀI LÀM (Tạo mảng cho câu 'is_sort')
            student_answers_map = {}
            for ans in student_answers_res.data:
                q_id = ans['exam_question_id']
                chosen_id = ans['chosen_answer_id']
                
                if q_id is None:
                    continue 
                    
                is_sort = question_type_map.get(q_id, False)

                if is_sort:
                    if q_id not in student_answers_map:
                        student_answers_map[q_id] = []
                    student_answers_map[q_id].append(chosen_id)
                else:
                    student_answers_map[q_id] = chosen_id

            # 6. GỘP (MERGE) DỮ LIỆU
            for section in exam_content.get('sections', []):
                for qt in section.get('question_types', []):
                    for question in qt.get('questions', []):
                        if not question:
                            continue 
                        
                        q_id = question.get('id')
                        chosen_data = student_answers_map.get(q_id)
                        
                        question['student_chosen_answer_id'] = chosen_data
                        
                        for answer in question.get('answers', []):
                            if not answer:
                                continue 
                                
                            a_id = answer.get('id')
                            
                            if isinstance(chosen_data, list):
                                answer['is_student_choice'] = (a_id in chosen_data)
                            else:
                                answer['is_student_choice'] = (a_id == chosen_data)

            # 7. ĐÓNG GÓI
            final_data = {
                'result_info': result_metadata, 
                'exam_content': exam_content
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