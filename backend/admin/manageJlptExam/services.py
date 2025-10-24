# exam/services.py
from config.supabase_client import supabase # Import supabase instance
from typing import Dict, List, Optional, Any
import math

class JlptExamService:
    """Service layer for handling JLPT exam operations"""

    @staticmethod
    def get_all_exams(page: int = 1, limit: int = 10, sort_by: Optional[str] = None, sort_direction: str = 'asc') -> Dict[str, Any]:
        """
        Get a paginated and sorted list of non-deleted JLPT exams.
        """
        try:
            from_index = (page - 1) * limit
            to_index = from_index + limit - 1

            query = supabase.table('jlpt_exams')\
                .select('id, level_id, title, total_duration, request_score, type, version', count='exact')\
                .is_('deleted_at', 'null')

            if sort_by:
                is_ascending = (sort_direction.lower() == 'asc')
                query = query.order(sort_by, ascending=is_ascending)
            else:
                query = query.order('created_at', desc=True) # Sắp xếp mặc định

            response = query.range(from_index, to_index).execute()

            return {
                'success': True,
                'data': response.data,
                'total_count': response.count
            }
        except Exception as e:
            print(f"Error getting all JLPT exams: {e}")
            return {'success': False, 'error': str(e), 'data': [], 'total_count': 0}

    @staticmethod
    def get_exam_by_id(exam_id: str) -> Dict[str, Any]:
        """
        Get a single non-deleted JLPT exam by ID.
        """
        try:
            response = supabase.table('jlpt_exams')\
                .select('id, level_id, title, total_duration, request_score, type, version')\
                .eq('id', exam_id)\
                .is_('deleted_at', 'null')\
                .single()\
                .execute()

            return {'success': True, 'data': response.data}
        except Exception as e:
            print(f"Error getting JLPT exam by ID {exam_id}: {e}")
            if "JSON object requested, multiple (or no) rows returned" in str(e):
                 return {'success': False, 'error': 'Exam not found or multiple entries exist'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def create_exam(exam_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new JLPT exam.
        Requires 'level_id' and 'title'.
        """
        if not exam_data.get('level_id') or not exam_data.get('title'):
             return {'success': False, 'error': 'Level ID and Title are required.'}

        try:
            response = supabase.table('jlpt_exams')\
                .insert(exam_data)\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 return {'success': False, 'error': 'Failed to create exam, no data returned.'}

        except Exception as e:
            print(f"Error creating JLPT exam: {e}")
            # Kiểm tra lỗi trùng lặp nếu có (ví dụ: title + level_id phải unique?)
            # if 'duplicate key value violates unique constraint' in str(e):
                 # return {'success': False, 'error': 'An exam with this title and level already exists.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def update_exam(exam_id: str, exam_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing JLPT exam by ID.
        """
        try:
            # Không cho phép cập nhật level_id? (Tùy logic)
            # exam_data.pop('level_id', None)

            response = supabase.table('jlpt_exams')\
                .update(exam_data)\
                .eq('id', exam_id)\
                .is_('deleted_at', 'null')\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 # Có thể xảy ra nếu ID không tồn tại hoặc đã bị xóa
                 return {'success': False, 'error': 'Exam not found or already deleted.'}

        except Exception as e:
            print(f"Error updating JLPT exam {exam_id}: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def delete_exam(exam_id: str) -> Dict[str, Any]:
        """
        Soft delete a JLPT exam by ID (sets deleted_at).
        """
        try:
            # Kiểm tra trước khi xóa
            check = supabase.table('jlpt_exams')\
                      .select('id')\
                      .eq('id', exam_id)\
                      .is_('deleted_at', 'null')\
                      .maybe_single()\
                      .execute()

            if not check.data:
                 return {'success': False, 'error': 'Exam not found or already deleted.'}

            # Thực hiện soft delete
            response = supabase.table('jlpt_exams')\
                .update({'deleted_at': 'now()'})\
                .eq('id', exam_id)\
                .execute()

            if response.data:
                return {'success': True}
            else:
                return {'success': False, 'error': 'Failed to soft delete exam.'}

        except Exception as e:
            print(f"Error deleting JLPT exam {exam_id}: {e}")
            return {'success': False, 'error': str(e)}