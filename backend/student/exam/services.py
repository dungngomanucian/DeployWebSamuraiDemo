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
        """Get exam details by ID including sections for duration calculation"""
        try:
            # Get exam details
            response = supabase.table('jlpt_exams')\
                .select('*, level:levels(id, title, description)')\
                .eq('id', exam_id)\
                .single()\
                .execute()
            
            exam_data = response.data
            
            # Get sections to calculate durations for intro pages (include is_listening for filtering)
            sections_response = supabase.table('jlpt_exam_sections')\
                .select('id, duration, position, is_listening, type')\
                .eq('exam_id', exam_id)\
                .order('position')\
                .execute()
            
            # Add sections to exam data
            exam_data['sections'] = sections_response.data if sections_response.data else []
            
            return {
                'success': True,
                'data': exam_data
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_exams_by_level(level_id: str) -> Dict:
        """Get all exams for a specific level - optimized query"""
        try:
            # Chỉ select các field cần thiết để tối ưu performance
            # Bao gồm level_id vì serializer yêu cầu field này
            response = supabase.table('jlpt_exams')\
                .select('id, level_id, title, type, total_duration, request_score, created_at, level:levels(id, title, description)')\
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
            response = supabase.table('jlpt_question_types')\
                .select('*, question_guides:jlpt_question_guides(id, name)')\
                .eq('exam_section_id', section_id)\
                .order('id')\
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
        """
        Get complete exam data including sections, questions, and answers
        OPTIMIZED: Uses batch queries instead of N+1 queries for better performance
        """
        try:
            # 1. Get exam info
            exam_result = ExamService.get_exam_by_id(exam_id)
            if not exam_result['success']:
                return exam_result
            
            # 2. Get all sections for this exam
            sections_result = ExamService.get_exam_sections(exam_id)
            if not sections_result['success']:
                return sections_result
            
            sections_data = sections_result['data']
            if not sections_data:
                return {
                    'success': True,
                    'data': {
                        'exam': exam_result['data'],
                        'sections': []
                    }
                }
            
            # 3. Get ALL question types for ALL sections in ONE query (batch)
            section_ids = [s['id'] for s in sections_data]
            try:
                all_question_types_response = supabase.table('jlpt_question_types')\
                    .select('*, question_guides:jlpt_question_guides(id, name)')\
                    .in_('exam_section_id', section_ids)\
                    .order('id')\
                    .execute()
                all_question_types = all_question_types_response.data if all_question_types_response.data else []
            except Exception as e:
                print(f"Error fetching question types: {str(e)}")
                all_question_types = []
            
            # Group question types by section_id
            question_types_by_section = {}
            for qt in all_question_types:
                section_id = qt.get('exam_section_id')
                if section_id not in question_types_by_section:
                    question_types_by_section[section_id] = []
                question_types_by_section[section_id].append(qt)
            
            # 4. Get ALL questions for ALL question types in ONE query (batch)
            question_type_ids = [qt['id'] for qt in all_question_types]
            all_questions = []
            all_passages_map = {}
            
            if question_type_ids:
                try:
                    # Get all questions
                    all_questions_response = supabase.table('jlpt_questions')\
                        .select('*')\
                        .in_('question_type_id', question_type_ids)\
                        .is_('deleted_at', 'null')\
                        .order('position')\
                        .execute()
                    all_questions = all_questions_response.data if all_questions_response.data else []
                    
                    # Get ALL passages for ALL question types (không chỉ perforated)
                    # Vì có thể có passages cho các question types khác
                    if question_type_ids:
                        try:
                            passages_response = supabase.table('jlpt_question_passages')\
                                .select('id, question_type_id, content, underline_text')\
                                .in_('question_type_id', question_type_ids)\
                                .execute()
                            if passages_response.data:
                                # Group passages by question_type_id
                                for passage in passages_response.data:
                                    qt_id = passage.get('question_type_id')
                                    if qt_id not in all_passages_map:
                                        all_passages_map[qt_id] = []
                                    all_passages_map[qt_id].append(passage)
                        except Exception as e:
                            print(f"Error fetching passages: {str(e)}")
                except Exception as e:
                    print(f"Error fetching questions: {str(e)}")
            
            # Tạo map passages theo ID để tra cứu nhanh
            passages_by_id = {}
            for qt_id, passages in all_passages_map.items():
                for passage in passages:
                    passages_by_id[passage['id']] = passage
            
            # Group questions by question_type_id
            questions_by_question_type = {}
            for question in all_questions:
                qt_id = question.get('question_type_id')
                if qt_id not in questions_by_question_type:
                    questions_by_question_type[qt_id] = []
                
                # Attach passage to question if exists
                passage_id = question.get('question_passages_id')
                if passage_id and passage_id in passages_by_id:
                    question['jlpt_question_passages'] = [passages_by_id[passage_id]]
                else:
                    question['jlpt_question_passages'] = None
                
                questions_by_question_type[qt_id].append(question)
            
            # 5. Get ALL answers for ALL questions in ONE query (batch)
            question_ids = [q['id'] for q in all_questions]
            all_answers = []
            
            if question_ids:
                try:
                    all_answers_response = supabase.table('jlpt_answers')\
                        .select('*')\
                        .in_('question_id', question_ids)\
                        .is_('deleted_at', 'null')\
                        .order('show_order')\
                        .execute()
                    all_answers = all_answers_response.data if all_answers_response.data else []
                except Exception as e:
                    print(f"Error fetching answers: {str(e)}")
            
            # Group answers by question_id and remove duplicates
            answers_by_question = {}
            seen_answer_ids = set()
            for answer in all_answers:
                answer_id = answer['id']
                if answer_id in seen_answer_ids:
                    continue
                seen_answer_ids.add(answer_id)
                
                question_id = answer.get('question_id')
                if question_id not in answers_by_question:
                    answers_by_question[question_id] = []
                answers_by_question[question_id].append(answer)
            
            # 6. Build the nested structure
            sections_with_data = []
            for section in sections_data:
                section_id = section['id']
                question_types_for_section = question_types_by_section.get(section_id, [])
                
                question_types_with_data = []
                for qt in question_types_for_section:
                    qt_id = qt['id']
                    
                    # Attach passages for question type (có thể có passages cho cả non-perforated)
                    qt['passages'] = all_passages_map.get(qt_id, [])
                    
                    # Attach questions
                    questions_for_qt = questions_by_question_type.get(qt_id, [])
                    questions_with_answers = []
                    
                    for question in questions_for_qt:
                        question_id = question['id']
                        # Attach answers
                        question['answers'] = answers_by_question.get(question_id, [])
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
            print(f"Error in get_full_exam_data: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


    # Xu ly luu bai thi   
    @staticmethod
    def _calculate_score(submitted_answers: List[Dict], all_question_details_map: Dict, section_name_map: Dict) -> Dict:
        """
        [Hàm private] Tính tổng điểm - ĐÃ CẬP NHẬT
        TRẢ VỀ: Một dictionary chứa tổng điểm VÀ điểm từng phần (theo section_id).
        Ví dụ: 
        {
            'total_score': 8.5, 
            'section_scores': [
                {'id': 'S01', 'score': 5.0, 'max': 10},
                {'id': 'S02', 'score': 3.5, 'max': 10}
            ]
        }
        """
        try:
            question_ids_answered = [a['exam_question_id'] for a in submitted_answers]
            if not question_ids_answered:
                 question_ids_answered = list(all_question_details_map.keys())

            a_data_res = supabase.table('jlpt_answers')\
                .select('id, question_id, points, position, is_correct')\
                .in_('question_id', question_ids_answered)\
                .is_('deleted_at', 'null')\
                .execute()

            if not a_data_res.data:
                 print("Lỗi: Không tìm thấy dữ liệu đáp án cho các câu đã trả lời.")

            answer_points_map = {
                a['id']: float(a.get('points', 0)) 
                for a in a_data_res.data 
                if a.get('points') is not None
            }
            
            correct_answer_map = {}
            partial_credit_answer_map = {}
            for a in a_data_res.data:
                q_id = a['question_id']
                if q_id not in correct_answer_map: correct_answer_map[q_id] = {}
                if a['position'] is not None:
                    correct_answer_map[q_id][a['id']] = a['position']
                    if a['is_correct']: partial_credit_answer_map[q_id] = a['id']
                elif a['is_correct']:
                    correct_answer_map[q_id][a['id']] = 1
            
            submitted_map = {}
            for sa in submitted_answers:
                q_id = sa['exam_question_id']
                if q_id not in submitted_map: submitted_map[q_id] = {}
                submitted_map[q_id][sa['chosen_answer_id']] = sa['position']
            
            
            # === SỬA BƯỚC 5: TÍNH ĐIỂM ===
            total_score = 0.0
            
            # 5A: TẠO TRACKER VỚI MAX_SCORE
            section_score_tracker = {}
            for q_id, q_info in all_question_details_map.items():
                section_id = q_info.get('section_id')
                section_type_name = section_name_map.get(section_id, 'Unknown') 
                question_max_score = float(q_info.get('score', 1))

                if section_type_name not in section_score_tracker:
                    # === SỬA LỖI: Thêm 'id' và 'type' vào value ===
                    section_score_tracker[section_type_name] = {
                        'id': section_id,
                        'type': section_type_name,
                        'score': 0.0, 
                        'max': 0.0
                    }
                
                section_score_tracker[section_type_name]['max'] += question_max_score

            # 5B: TÍNH ĐIỂM ĐẠT ĐƯỢC
            for q_id, student_answers_dict in submitted_map.items():
                q_info = all_question_details_map.get(q_id)
                correct_answers_dict = correct_answer_map.get(q_id)
                
                if not q_info or not correct_answers_dict: continue

                section_id = q_info.get('section_id')
                section_type_name = section_name_map.get(section_id, 'Unknown')
                question_max_score = float(q_info.get('score', 1))
                
                earned_score = 0.0
                is_sorting_question = len(correct_answers_dict) > 1
                
                if is_sorting_question:
                    if student_answers_dict == correct_answers_dict:
                        earned_score = question_max_score
                    else:
                        partial_credit_ans_id = partial_credit_answer_map.get(q_id)
                        if partial_credit_ans_id:
                            student_pos = student_answers_dict.get(partial_credit_ans_id)
                            correct_pos = correct_answers_dict.get(partial_credit_ans_id)
                            if student_pos is not None and student_pos == correct_pos:
                                earned_score = answer_points_map.get(partial_credit_ans_id, 0.5)
                else: # Câu trắc nghiệm
                    if student_answers_dict == correct_answers_dict:
                        earned_score = question_max_score
                
                total_score += earned_score
                if section_type_name in section_score_tracker:
                    section_score_tracker[section_type_name]['score'] += earned_score

            # === SỬA LỖI: Lặp qua .values() thay vì .items() ===
            section_scores_list = [
                {
                    'id': v['id'],
                    'type': v['type'],
                    'score': v['score'],
                    'max_score': int(round(v['max']))
                } 
                for v in section_score_tracker.values()
            ]

            return {
                'total_score': total_score,
                'section_scores': section_scores_list
            }

        except Exception as e:
            print(f"Lỗi nghiêm trọng khi tính điểm: {str(e)}")
            return {'total_score': 0, 'section_scores': []}
        
        
    @staticmethod
    def submit_full_exam(student_id: str, exam_id: str, duration: int, answers_list: List[Dict]) -> Dict:
        """
        Hàm service chính để nộp bài (ĐÃ CẬP NHẬT):
        """
        try:
            # 1. Lấy TẤT CẢ sections cho exam_id
            all_section_res = supabase.table('jlpt_exam_sections')\
                .select('id, type')\
                .eq('exam_id', exam_id)\
                .execute()
            if not all_section_res.data: raise Exception("Không tìm thấy section cho exam")
            
            # Tạo map: {'S01': '文字・語彙', 'S02': '文法・読解', ...}
            section_name_map = {s['id']: s['type'] for s in all_section_res.data}
            all_section_ids = list(section_name_map.keys())

            # 2. Lấy TẤT CẢ questions cho TẤT CẢ sections
            all_q_data_res = supabase.table('jlpt_questions')\
                .select('id, score, question_type_id, exam_section_id')\
                .in_('exam_section_id', all_section_ids)\
                .is_('deleted_at', 'null')\
                .execute()
            if not all_q_data_res.data: raise Exception("Không tìm thấy câu hỏi cho exam")
            
            # map ĐẦY ĐỦ
            all_question_details_map = {
                q['id']: {
                    'score': q.get('score', 1),
                    'type': q.get('question_type_id'), 
                    'section_id': q.get('exam_section_id')
                } for q in all_q_data_res.data
            }
            # === KẾT THÚC SỬA LỖI ===

            # 3. Tính điểm (dùng map ĐẦY ĐỦ)
            score_result = ExamService._calculate_score(answers_list, all_question_details_map, section_name_map)
            
            sum_score = score_result['total_score']
            section_scores = score_result['section_scores'] # List này giờ chứa ID và Tên

            duration_in_minutes = round(duration / 60)
            
            # 4. Chuẩn bị dữ liệu cho 'exam_results'
            result_data = {
                'exam_id': exam_id,
                'student_id': student_id,
                'sum_score': sum_score, # <-- Điểm float (8.5)
                'duration': duration_in_minutes,
                'datetime': datetime.now(timezone.utc).isoformat(),
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            # 5. Tạo 'exam_results'
            result_res = supabase.table('exam_results').insert(result_data).execute()
            if not result_res.data: raise Exception("Không thể tạo exam_result")
            new_exam_result = result_res.data[0]
            new_exam_result_id = new_exam_result['id'] # Lấy ID (số nguyên) vừa tạo
            
            # 6. Chuẩn bị dữ liệu cho 'save_answers'
            answers_to_save = []
            for answer in answers_list:
                q_id = answer['exam_question_id']
                section_id = all_question_details_map.get(q_id, {}).get('section_id') # Dùng map đầy đủ
                answers_to_save.append({
                    'exam_result_id': new_exam_result_id,
                    'exam_section_id': section_id,
                    'exam_question_id': q_id,
                    'chosen_answer_id': answer['chosen_answer_id'],
                    'position': answer['position'],
                    'created_at': datetime.now(timezone.utc).isoformat()
                })

            # 7a. Lưu 'save_answers'
            if answers_to_save:
                supabase.table('save_answers').insert(answers_to_save).execute()

            # 7b. Lưu 'exam_result_sections'
            if section_scores:
                sections_to_save = []
                for sec in section_scores:
                    sections_to_save.append({
                        'exam_result_id': new_exam_result_id,
                        'exam_section_id': sec['id'], # <-- Lưu ID ('S01', 'S02')
                        'score': sec['score'],
                        'max_score': sec['max_score']
                    })
                
                if sections_to_save:
                    # Sửa lại lệnh insert để khớp với DB
                    supabase.table('exam_result_sections').insert(sections_to_save).execute()

            # 7c. Tạo chứng chỉ
            try:
                cert_data = {
                    'student_id': student_id,
                    'exam_result_id': new_exam_result_id,
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                supabase.table('certificates').insert(cert_data).execute()
            except Exception as cert_error:
                print(f"Lỗi khi tạo chứng chỉ: {str(cert_error)}")

            # Gộp dữ liệu trả về
            response_data = new_exam_result
            response_data['section_scores'] = section_scores # Gắn điểm từng phần vào

            return {
                'success': True,
                'data': response_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def submit_listening_exam(exam_result_id: str, student_id: str, exam_id: str, duration: int, answers_list: List[Dict]) -> Dict:
        """
        Submit listening exam - update existing exam_result_sections and exam_results
        """
        try:
            # 1. Get exam_result to verify it exists and belongs to this student
            exam_result_res = supabase.table('exam_results')\
                .select('id, sum_score')\
                .eq('id', exam_result_id)\
                .eq('student_id', student_id)\
                .eq('exam_id', exam_id)\
                .single()\
                .execute()
            
            if not exam_result_res.data:
                return {'success': False, 'error': 'Exam result not found'}
            
            current_sum_score = float(exam_result_res.data.get('sum_score', 0))
            
            # 2. Get listening section IDs first
            sections_res = supabase.table('jlpt_exam_sections')\
                .select('id, type, exam_id')\
                .eq('exam_id', exam_id)\
                .eq('is_listening', True)\
                .execute()
            
            if not sections_res.data:
                return {'success': False, 'error': 'No listening sections found'}
            
            listening_section_ids = [s['id'] for s in sections_res.data]
            section_name_map = {s['id']: s['type'] for s in sections_res.data}
            
            # 3. Get questions for listening sections only
            questions_res = supabase.table('jlpt_questions')\
                .select('id, exam_section_id, score')\
                .in_('exam_section_id', listening_section_ids)\
                .is_('deleted_at', 'null')\
                .execute()
            
            if not questions_res.data:
                return {'success': False, 'error': 'No questions found'}
            
            # 4. Create question details map
            all_question_details_map = {
                q['id']: {
                    'section_id': q['exam_section_id'],
                    'score': q.get('score', 1)
                }
                for q in questions_res.data
            }
            
            # 5. Calculate listening score
            score_result = ExamService._calculate_score(answers_list, all_question_details_map, section_name_map)
            listening_score = score_result['total_score']
            section_scores = score_result['section_scores']
            
            # 6. Update exam_result_sections for listening sections
            for section_score_data in section_scores:
                section_id = section_score_data['id']
                section_score = section_score_data['score']
                
                # Update the existing record
                supabase.table('exam_result_sections')\
                    .update({'score': section_score})\
                    .eq('exam_result_id', exam_result_id)\
                    .eq('exam_section_id', section_id)\
                    .execute()
            
            # 7. Update exam_results.sum_score
            new_sum_score = current_sum_score + listening_score
            supabase.table('exam_results')\
                .update({'sum_score': new_sum_score})\
                .eq('id', exam_result_id)\
                .execute()
            
            # 8. Save listening answers
            formatted_answers = []
            for ans in answers_list:
                q_id = ans['exam_question_id']
                section_id = all_question_details_map.get(q_id, {}).get('section_id')
                formatted_answers.append({
                    'exam_result_id': exam_result_id,
                    'exam_section_id': section_id,
                    'exam_question_id': q_id,
                    'chosen_answer_id': ans['chosen_answer_id'],
                    'position': ans.get('position', 1),
                    'created_at': datetime.now(timezone.utc).isoformat()
                })
            
            if formatted_answers:
                supabase.table('save_answers').insert(formatted_answers).execute()
            
            # 9. Get full exam_result data to return
            final_result_res = supabase.table('exam_results')\
                .select('*')\
                .eq('id', exam_result_id)\
                .single()\
                .execute()
            
            # 10. Get all section scores from exam_result_sections (including reading sections)
            all_section_scores_res = supabase.table('exam_result_sections')\
                .select('exam_section_id, score, jlpt_exam_sections(type)')\
                .eq('exam_result_id', exam_result_id)\
                .execute()
            
            # 11. Get max scores for each section by summing question scores
            all_sections_in_exam = supabase.table('jlpt_exam_sections')\
                .select('id, type')\
                .eq('exam_id', exam_id)\
                .is_('deleted_at', 'null')\
                .execute()
            
            section_max_scores = {}
            if all_sections_in_exam.data:
                section_ids = [s['id'] for s in all_sections_in_exam.data]
                questions_in_sections = supabase.table('jlpt_questions')\
                    .select('exam_section_id, score')\
                    .in_('exam_section_id', section_ids)\
                    .is_('deleted_at', 'null')\
                    .execute()
                
                for q in questions_in_sections.data:
                    sec_id = q['exam_section_id']
                    q_score = float(q.get('score', 1))
                    section_max_scores[sec_id] = section_max_scores.get(sec_id, 0.0) + q_score
            
            # Format section scores for response
            all_section_scores = []
            if all_section_scores_res.data:
                for item in all_section_scores_res.data:
                    section_info = item.get('jlpt_exam_sections', {})
                    sec_id = item['exam_section_id']
                    all_section_scores.append({
                        'id': sec_id,
                        'type': section_info.get('type', 'N/A'),
                        'score': item['score'],
                        'max_score': int(round(section_max_scores.get(sec_id, 0)))
                    })
            
            if final_result_res.data:
                result_data = final_result_res.data
                result_data['section_scores'] = all_section_scores
                result_data['listening_score'] = listening_score
                
                return {
                    'success': True,
                    'data': result_data
                }
            else:
                return {
                    'success': True,
                    'data': {
                        'id': exam_result_id,
                        'sum_score': new_sum_score,
                        'listening_score': listening_score,
                        'section_scores': all_section_scores
                    }
                }
            
            
        except Exception as e:
            print(f"Error in submit_listening_exam: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
        

