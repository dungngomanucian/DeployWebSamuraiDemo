"""
Business logic for exam operations
Handles all Supabase queries for exam-related functionality
"""
from config.supabase_client import supabase
from typing import Dict, List, Optional
from datetime import datetime, timezone

class ExamService:
    """Service for handling exam-related operations"""
    
    @staticmethod
    def get_levels() -> Dict:
        """Get all JLPT levels"""
        try:
            response = supabase.table('levels')\
                .select('*')\
                .is_('deleted_at', 'null')\
                .order('title', desc=True)\
                .execute()
            
            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_exam_by_id(exam_id: str) -> Dict:
        """Get exam details by ID"""
        try:
            response = supabase.table('jlpt_exams')\
                .select('*, level:levels(id, title, description)')\
                .eq('id', exam_id)\
                .single()\
                .execute()
            
            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_exams_by_level(level_id: str) -> Dict:
        """Get all exams for a specific level"""
        try:
            response = supabase.table('jlpt_exams')\
                .select('*, level:levels(id, title, description)')\
                .eq('level_id', level_id)\
                .is_('deleted_at', 'null')\
                .order('created_at', desc=True)\
                .execute()
            
            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_exam_sections(exam_id: str) -> Dict:
        """Get all sections of an exam"""
        try:
            response = supabase.table('jlpt_exam_sections')\
                .select('*')\
                .eq('exam_id', exam_id)\
                .order('position')\
                .execute()
            
            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_question_types(section_id: str) -> Dict:
        """Get all question types of a section"""
        try:
            # 1) Lấy các question_types theo section
            qt_response = supabase.table('jlpt_question_types')\
                .select('id, exam_section_id, question_guides_id, task_instructions, image_path, duration')\
                .eq('exam_section_id', section_id)\
                .order('id')\
                .execute()

            qts = qt_response.data or []

            # 2) Thu thập tất cả question_guides_id và lấy tên từ bảng jlpt_question_guides
            guide_ids = []
            for qt in qts:
                qg_id = qt.get('question_guides_id')
                # Kiểm tra qg_id hợp lệ (không None, không null, không rỗng)
                if qg_id is not None and qg_id != 'null' and str(qg_id).strip():
                    guide_ids.append(str(qg_id).strip())
            
            guides_map = {}
            if guide_ids:
                try:
                    guides_res = supabase.table('jlpt_question_guides')\
                        .select('id, name')\
                        .in_('id', guide_ids)\
                        .execute()
                    for g in (guides_res.data or []):
                        guides_map[g['id']] = g
                except Exception as e:
                    print(f"Error fetching question guides: {e}")

            # 3) Gắn thêm trường question_guides vào từng question_type (để FE hiển thị tiếng Việt)
            for qt in qts:
                qg_id = qt.get('question_guides_id')
                if qg_id is not None and qg_id != 'null' and str(qg_id).strip():
                    guide = guides_map.get(str(qg_id).strip())
                    if guide:
                        qt['question_guides'] = {'id': guide['id'], 'name': guide.get('name')}
                    else:
                        qt['question_guides'] = None
                else:
                    qt['question_guides'] = None

            return {
                'success': True,
                'data': qts
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_questions(question_type_id: str) -> Dict:
        """Get all questions of a question type"""
        try:
            # First get questions
            questions_response = supabase.table('jlpt_questions')\
                .select('*')\
                .eq('question_type_id', question_type_id)\
                .is_('deleted_at', 'null')\
                .order('position')\
                .execute()
            
            # Get all passages for this question type
            passages_response = supabase.table('jlpt_question_passages')\
                .select('*')\
                .eq('question_type_id', question_type_id)\
                .execute()
            
            # Create a map of passages by id for quick lookup
            passages_map = {p['id']: p for p in passages_response.data}
            
            # Combine questions with their specific passage
            questions_with_passages = []
            for question in questions_response.data:
                # Get the specific passage for this question using question_passages_id
                passage_id = question.get('question_passages_id')
                if passage_id and passage_id in passages_map:
                    question['jlpt_question_passages'] = [passages_map[passage_id]]
                else:
                    question['jlpt_question_passages'] = None
                questions_with_passages.append(question)
            
            return {
                'success': True,
                'data': questions_with_passages
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_answers(question_id: str) -> Dict:
        """Get all answers of a question"""
        try:
            response = supabase.table('jlpt_answers')\
                .select('*')\
                .eq('question_id', question_id)\
                .is_('deleted_at', 'null')\
                .order('show_order')\
                .execute()
            
            # Remove duplicates based on id
            unique_answers = []
            seen_ids = set()
            for answer in response.data:
                if answer['id'] not in seen_ids:
                    seen_ids.add(answer['id'])
                    unique_answers.append(answer)
            
            return {
                'success': True,
                'data': unique_answers
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_full_exam_data(exam_id: str) -> Dict:
        """Get complete exam data including sections, questions, and answers"""
        try:
            # 1. Get exam info
            exam_result = ExamService.get_exam_by_id(exam_id)
            if not exam_result['success']:
                return exam_result
            
            # 2. Get sections
            sections_result = ExamService.get_exam_sections(exam_id)
            if not sections_result['success']:
                return sections_result
            
            sections_with_data = []
            
            # 3. Get question types for each section
            for section in sections_result['data']:
                qt_result = ExamService.get_question_types(section['id'])
                if not qt_result['success']:
                    continue
                
                question_types_with_data = []
                
                # 4. Get questions for each question type
                for qt in qt_result['data']:
                    # Attach passages only for specific question type QT008
                    try:
                        if qt.get('id') == 'QT008':
                            passages_response = supabase.table('jlpt_question_passages')\
                                .select('id, question_type_id, content, underline_text')\
                                .eq('question_type_id', qt['id'])\
                                .execute()
                            qt['passages'] = passages_response.data
                    except Exception:
                        # If passages query fails, keep proceeding without blocking
                        qt['passages'] = []

                    q_result = ExamService.get_questions(qt['id'])
                    if not q_result['success']:
                        continue
                    
                    questions_with_answers = []
                    
                    # 5. Get answers for each question
                    for question in q_result['data']:
                        a_result = ExamService.get_answers(question['id'])
                        if a_result['success']:
                            question['answers'] = a_result['data']
                        else:
                            question['answers'] = []
                        questions_with_answers.append(question)
                    
                    qt['questions'] = questions_with_answers
                    question_types_with_data.append(qt)
                
                section['question_types'] = question_types_with_data
                sections_with_data.append(section)
            
            return {
                'success': True,
                'data': {
                    'exam': exam_result['data'],
                    'sections': sections_with_data
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


    # Xu ly luu bai thi   
    @staticmethod
    def _calculate_score(submitted_answers: List[Dict], question_details_map: Dict) -> int:
        """
        [Hàm private] Tính tổng điểm - ĐÃ CẬP NHẬT LOGIC
        - Trắc nghiệm: So sánh 1-1, lấy điểm từ jlpt_answers (thường là 1).
        - Sắp xếp:
            1. Nếu đúng HẾT VỊ TRÍ -> Lấy điểm tối đa từ jlpt_questions (ví dụ: 1).
            2. Nếu sai -> Kiểm tra xem câu có 'is_correct: true' có đúng vị trí không.
            3. Nếu đúng -> Lấy điểm partial (ví dụ: 0.5) từ jlpt_answers.
        """
        try:
            # 1. Lấy ID câu hỏi từ danh sách nộp
            question_ids = list(question_details_map.keys())
            if not question_ids:
                return 0

            # 2. Lấy TẤT CẢ các đáp án (cả đúng và sai) cho các câu hỏi này
            a_data_res = supabase.table('jlpt_answers')\
                .select('id, question_id, points, position, is_correct')\
                .in_('question_id', question_ids)\
                .is_('deleted_at', 'null')\
                .execute()

            if not a_data_res.data:
                return 0

            # 3. Xây dựng 3 Map tra cứu
            
            # Map 1: Lưu điểm của TỪNG ĐÁP ÁN (cho cả trắc nghiệm và partial)
            # {'AW000185': 1.0, 'AW000193': 0.5, ...}
            answer_points_map = {
                a['id']: float(a.get('points', 0)) 
                for a in a_data_res.data 
                if a.get('points') is not None
            }
            
            # Map 2: Lưu đáp án ĐÚNG (cho cả MC và Sắp xếp)
            # {'Q00046': {'AW000185': 1}, 
            #  'Q00049': {'AW000195': 1, 'AW000194': 2, 'AW000193': 3, 'AW000196': 4}}
            correct_answer_map = {}
            for a in a_data_res.data:
                q_id = a['question_id']
                if q_id not in correct_answer_map:
                    correct_answer_map[q_id] = {}
                
                if a['position'] is not None: # Đây là câu sắp xếp (Rule 3)
                    correct_answer_map[q_id][a['id']] = a['position']
                elif a['is_correct']: # Đây là câu trắc nghiệm (Rule 2)
                    correct_answer_map[q_id][a['id']] = 1 # Vị trí mặc định là 1

            # Map 3: Lưu ID của đáp án cho ĐIỂM PARTIAL (chỉ dành cho câu sắp xếp)
            # Ví dụ: {'Q00049': 'AW000193'}
            partial_credit_answer_map = {}
            for a in a_data_res.data:
                # Nếu là câu sắp xếp VÀ là câu cho điểm partial
                if a['position'] is not None and a['is_correct']:
                    partial_credit_answer_map[a['question_id']] = a['id']

            # 4. Nhóm các câu trả lời học sinh đã nộp
            submitted_map = {}
            for sa in submitted_answers:
                q_id = sa['exam_question_id']
                if q_id not in submitted_map:
                    submitted_map[q_id] = {}
                submitted_map[q_id][sa['chosen_answer_id']] = sa['position']

            # 5. So sánh và tính điểm
            total_score = 0.0
            for q_id, student_answers_dict in submitted_map.items():
                q_info = question_details_map.get(q_id)
                correct_answers_dict = correct_answer_map.get(q_id)
                
                if not q_info or not correct_answers_dict:
                    continue # Bỏ qua nếu câu hỏi hoặc đáp án đúng không tồn tại

                # Tự động phát hiện câu sắp xếp (nếu có > 1 đáp án đúng)
                is_sorting_question = len(correct_answers_dict) > 1
                
                if is_sorting_question:
                    # === LOGIC MỚI ===
                    
                    # TRƯỜNG HỢP 2: Học viên sắp xếp đúng HẾT TẤT CẢ
                    if student_answers_dict == correct_answers_dict:
                        # Lấy điểm tối đa từ bảng jlpt_questions
                        total_score += float(q_info.get('score', 0))
                    else:
                        # TRƯỜNG HỢP 1: Học viên sai, kiểm tra partial credit
                        print(f"  -> Sắp xếp sai. Bắt đầu kiểm tra partial credit cho Q:{q_id}") # DEBUG

                        # Lấy ID của đáp án duy nhất cho điểm partial (ví dụ 'AW000193' cho 'Q00049')
                        partial_credit_ans_id = partial_credit_answer_map.get(q_id)
                        print(f"    -> ID đáp án (có sao) cần đúng vị trí: {partial_credit_ans_id}") # DEBUG

                        if partial_credit_ans_id:
                            # Lấy vị trí HỌC VIÊN nộp cho câu đó
                            student_pos = student_answers_dict.get(partial_credit_ans_id)
                            # Lấy vị trí ĐÚNG của câu đó
                            correct_pos = correct_answers_dict.get(partial_credit_ans_id)
                            
                            print(f"    -> Vị trí học viên đặt: {student_pos} (kiểu: {type(student_pos)})") # DEBUG
                            print(f"    -> Vị trí đúng cần đặt: {correct_pos} (kiểu: {type(correct_pos)})") # DEBUG

                            # Nếu 2 vị trí khớp NHAU
                            if student_pos is not None and student_pos == correct_pos:
                                partial_points = answer_points_map.get(partial_credit_ans_id, 0.5)
                                total_score += partial_points
                                print(f"    -> >> ĐÚNG VỊ TRÍ PARTIAL! << Lấy điểm từ answer_points_map: {partial_points}. Tổng điểm hiện tại: {total_score}") # DEBUG
                            else:
                                print(f"    -> SAI vị trí partial hoặc học viên không chọn đáp án này.") # DEBUG
                        else:
                            print(f"    -> Không tìm thấy đáp án is_correct=True cho câu này trong partial_credit_answer_map.") # DEBUG
                
                else:
                    # Xử lý câu trắc nghiệm (MC) - Logic này vẫn đúng
                    if student_answers_dict == correct_answers_dict:
                        submitted_ans_id = list(student_answers_dict.keys())[0]
                        total_score += answer_points_map.get(submitted_ans_id, 1.0)

            return total_score

        except Exception as e:
            print(f"Lỗi nghiêm trọng khi tính điểm: {str(e)}")
            return 0
        
        
    @staticmethod
    def submit_full_exam(student_id: str, exam_id: str, duration: int, answers_list: List[Dict]) -> Dict:
        """
        Hàm service chính để nộp bài (PHIÊN BẢN ĐÚNG):
        1. Lấy thông tin câu hỏi (để lấy section_id và pass cho hàm tính điểm)
        2. Tính điểm
        3. Tạo 'exam_results' (Bản ghi mới)
        4. Lưu 'save_answers' (với section_id)
        """
        try:
            # 1. Lấy ID câu hỏi từ danh sách nộp
            question_ids = list(set(a['exam_question_id'] for a in answers_list))
            if not question_ids:
                raise Exception("Không có câu trả lời nào được nộp")

            # 2. Lấy thông tin chi tiết (score, type, section_id) cho TẤT CẢ câu hỏi đã nộp
            q_data_res = supabase.table('jlpt_questions')\
                .select('id, score, question_type_id, exam_section_id')\
                .in_('id', question_ids)\
                .execute()
                
            if not q_data_res.data:
                raise Exception("Không tìm thấy thông tin câu hỏi")
                
            # Tạo Map tra cứu: {'Q00049': {'score': 1, 'type': 'QT007', 'section_id': 'S02'}, ...}
            question_details_map = {
                q['id']: {
                    'score': q.get('score', 0), 
                    'type': q.get('question_type_id'), 
                    'section_id': q.get('exam_section_id')
                } for q in q_data_res.data
            }

            # 3. Tính điểm (GỌI HÀM MỚI CỦA BẠN)
            sum_score = ExamService._calculate_score(answers_list, question_details_map)
            
            duration_in_minutes = round(duration / 60)

            # 4. Chuẩn bị dữ liệu cho 'exam_results'
            result_data = {
                'exam_id': exam_id,
                'student_id': student_id,
                'sum_score': sum_score, # <-- Điểm thật
                'duration': duration_in_minutes,
                'datetime': datetime.now(timezone.utc).isoformat(),
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            # 5. Tạo 'exam_results' (LUÔN TẠO MỚI)
            result_res = supabase.table('exam_results').insert(result_data).execute()
            
            if not result_res.data:
                raise Exception("Không thể tạo exam_result")
                
            new_exam_result = result_res.data[0]
            new_exam_result_id = new_exam_result['id']
            
            # 6. Chuẩn bị dữ liệu cho 'save_answers'
            answers_to_save = []
            for answer in answers_list:
                q_id = answer['exam_question_id']
                # Lấy section_id từ map đã tạo ở bước 2
                section_id = question_details_map.get(q_id, {}).get('section_id')

                answers_to_save.append({
                    'exam_result_id': new_exam_result_id,
                    'exam_section_id': section_id,
                    'exam_question_id': q_id,
                    'chosen_answer_id': answer['chosen_answer_id'],
                    'position': answer['position'],
                    'created_at': datetime.now(timezone.utc).isoformat()

                })

            # 7. Lưu 'save_answers'
            if answers_to_save:
                save_res = supabase.table('save_answers').insert(answers_to_save).execute()
                if not save_res.data:
                    # TODO: Lý tưởng nhất là ROLLBACK (xóa exam_result đã tạo)
                    raise Exception("Lưu chi tiết câu trả lời thất bại")

            # === BƯỚC MỚI (7b): TẠO CHỨNG CHỈ ===
            try:
                cert_data = {
                    'student_id': student_id,
                    'exam_result_id': new_exam_result_id,
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                cert_res = supabase.table('certificates').insert(cert_data).execute()
                
                if not cert_res.data:
                     # Chỉ log lỗi, không dừng luồng chính
                    print(f"Cảnh báo: Không thể tạo chứng chỉ cho exam_result_id {new_exam_result_id}")
            
            except Exception as cert_error:
                print(f"Lỗi khi tạo chứng chỉ: {str(cert_error)}")
            # ==================================

            return {
                'success': True,
                'data': new_exam_result # Trả về kết quả (gồm điểm)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def save_exam_result(result_data: Dict) -> Dict:
        """Save exam result"""
        try:
            response = supabase.table('exam_results')\
                .insert(result_data)\
                .execute()
            
            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def save_student_answers(answers: List[Dict]) -> Dict:
        """Save student answers"""
        try:
            response = supabase.table('save_answers')\
                .insert(answers)\
                .execute()
            
            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
        




