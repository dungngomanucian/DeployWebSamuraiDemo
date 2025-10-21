"""
Business logic for student operations in admin panel
Handles all Supabase queries for student-related functionality
"""
from config.supabase_client import supabase
from typing import Dict, List, Optional


class StudentService:
    """Service for handling student-related operations in admin panel"""
    
    @staticmethod
    def get_all_students(page: int = 1, limit: int = 10) -> Dict[str, any]:
        """
        Get a paginated list of students.

        Args:
            page (int): The current page number (starting from 1).
            limit (int): The number of items per page.

        Returns:
            Dict: A dictionary containing 'success', 'data' (list of students), 
                  and 'total_count' (total number of students).
        """
        try:
            # 1. Tính toán range cho Supabase
            from_index = (page - 1) * limit
            to_index = from_index + limit - 1
            
            # 3. Thực hiện truy vấn với select count và range
            response = supabase.table('students')\
                .select('*', count='exact')\
                .is_('deleted_at', 'null')\
                .order('created_at', desc=True)\
                .range(from_index, to_index)\
                .execute()
            
            # response object structure: 
            # { "data": [...], "count": total_number }
            
            return {
                'success': True,
                'data': response.data,
                'total_count': response.count # Lấy tổng số từ response
            }
        except Exception as e:
            print(f"Lỗi khi lấy danh sách student (phân trang): {e}")
            return {
                'success': False,
                'error': str(e),
                'data': [],
                'total_count': 0
            }
    
    @staticmethod
    def get_student_by_id(student_id: str) -> Dict:
        """Get student details by ID"""
        try:
            response = supabase.table('students')\
                .select('*')\
                .eq('id', student_id)\
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
    def create_student(student_data: Dict) -> Dict:
        """Create a new student"""
        try:
            response = supabase.table('students')\
                .insert(student_data)\
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
    def update_student(student_id: str, student_data: Dict) -> Dict:
        """Update student information"""
        try:
            response = supabase.table('students')\
                .update(student_data)\
                .eq('id', student_id)\
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
    def delete_student(student_id: str) -> Dict:
        """Soft delete a student (update deleted_at field)"""
        try:
            response = supabase.table('students')\
                .update({'deleted_at': 'now()'})\
                .eq('id', student_id)\
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
    def get_student_exam_history(student_id: str) -> Dict:
        """Get exam history for a specific student"""
        try:
            response = supabase.table('student_exams')\
                .select('*, exam:jlpt_exams(id, title, level_id), level:levels(id, title)')\
                .eq('student_id', student_id)\
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
    def get_student_progress(student_id: str) -> Dict:
        """Get learning progress for a specific student"""
        try:
            response = supabase.table('student_progress')\
                .select('*, level:levels(id, title)')\
                .eq('student_id', student_id)\
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
    def filter_students(filters: Dict, page: int = 1, limit: int = 10) -> Dict:
        """
        Filter students based on various criteria with pagination.
        (Cần cập nhật tương tự như get_all_students nếu muốn phân trang cho filter)
        """
        # Tạm thời giữ nguyên logic cũ, bạn có thể cập nhật sau nếu cần
        try:
            query = supabase.table('students')\
                .select('*, level:levels(id, title)')\
                .is_('deleted_at', 'null')

            if 'level_id' in filters:
                query = query.eq('level_id', filters['level_id'])
            
            if 'search' in filters:
                query = query.ilike('name', f"%{filters['search']}%")

            response = query.order('created_at', desc=True).execute()
            
            return {
                'success': True,
                'data': response.data,
                'total_count': len(response.data) # Tạm tính total_count cho filter
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }