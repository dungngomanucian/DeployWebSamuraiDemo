# teacher/services.py
from config.supabase_client import supabase # Import supabase instance
from typing import Dict, List, Optional, Any
import math

class TeacherService:
    """Service layer for handling teacher operations"""

    @staticmethod
    def get_all_teachers(page: int = 1, limit: int = 10, sort_by: Optional[str] = None, sort_direction: str = 'asc') -> Dict[str, Any]:
        """
        Get a paginated and sorted list of non-deleted teachers.
        """
        try:
            from_index = (page - 1) * limit
            to_index = from_index + limit - 1

            query = supabase.table('teachers')\
                .select('id, account_id, full_name, bio', count='exact')\
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
            print(f"Error getting all teachers: {e}")
            return {'success': False, 'error': str(e), 'data': [], 'total_count': 0}

    @staticmethod
    def get_teacher_by_id(teacher_id: str) -> Dict[str, Any]:
        """
        Get a single non-deleted teacher by ID.
        """
        try:
            response = supabase.table('teachers')\
                .select('id, account_id, full_name, bio')\
                .eq('id', teacher_id)\
                .is_('deleted_at', 'null')\
                .single()\
                .execute()

            return {'success': True, 'data': response.data}
        except Exception as e:
            print(f"Error getting teacher by ID {teacher_id}: {e}")
            if "JSON object requested, multiple (or no) rows returned" in str(e):
                 return {'success': False, 'error': 'Teacher not found or multiple entries exist'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def create_teacher(teacher_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new teacher.
        Requires 'account_id' and 'full_name'.
        """
        # Kiểm tra các trường bắt buộc (có thể làm ở serializer)
        if not teacher_data.get('account_id') or not teacher_data.get('full_name'):
             return {'success': False, 'error': 'Account ID and Full Name are required.'}

        try:
            response = supabase.table('teachers')\
                .insert(teacher_data)\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 return {'success': False, 'error': 'Failed to create teacher, no data returned.'}

        except Exception as e:
            print(f"Error creating teacher: {e}")
            # Kiểm tra lỗi trùng lặp nếu có unique constraints (ví dụ: account_id phải là duy nhất)
            if 'duplicate key value violates unique constraint' in str(e):
                 if 'teachers_account_id_key' in str(e): # Giả sử tên constraint
                     return {'success': False, 'error': 'This account is already assigned to another teacher.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def update_teacher(teacher_id: str, teacher_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing teacher by ID.
        """
        try:
            # Không cho phép cập nhật account_id (thường là không nên)
            teacher_data.pop('account_id', None) 

            response = supabase.table('teachers')\
                .update(teacher_data)\
                .eq('id', teacher_id)\
                .is_('deleted_at', 'null')\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 # Có thể xảy ra nếu ID không tồn tại hoặc đã bị xóa
                 return {'success': False, 'error': 'Teacher not found or already deleted.'}

        except Exception as e:
            print(f"Error updating teacher {teacher_id}: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def delete_teacher(teacher_id: str) -> Dict[str, Any]:
        """
        Soft delete a teacher by ID (sets deleted_at).
        """
        try:
            # Kiểm tra trước khi xóa
            check = supabase.table('teachers')\
                      .select('id')\
                      .eq('id', teacher_id)\
                      .is_('deleted_at', 'null')\
                      .maybe_single()\
                      .execute()

            if not check.data:
                 return {'success': False, 'error': 'Teacher not found or already deleted.'}

            # Thực hiện soft delete
            response = supabase.table('teachers')\
                .update({'deleted_at': 'now()'})\
                .eq('id', teacher_id)\
                .execute()

            if response.data:
                return {'success': True}
            else:
                return {'success': False, 'error': 'Failed to soft delete teacher.'}

        except Exception as e:
            print(f"Error deleting teacher {teacher_id}: {e}")
            return {'success': False, 'error': str(e)}