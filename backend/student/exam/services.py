"""
Business logic for exam operations
Handles all Supabase queries for exam-related functionality
"""
from config.supabase_client import supabase
from typing import Dict, List, Optional


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
            response = supabase.table('jlpt_questions')\
                .select('*, question_passages:jlpt_question_passages(id, content, underline_text)')\
                .eq('question_type_id', question_type_id)\
                .is_('deleted_at', 'null')\
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
