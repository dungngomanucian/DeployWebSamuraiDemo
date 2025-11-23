# classroom/services.py
from config.supabase_client import supabase # Import supabase instance
from typing import Dict, List, Optional, Any
import math

class ClassroomService:
    """Service layer for handling classroom operations"""

    @staticmethod
    def get_all_classrooms(page: int = 1, limit: int = 10, sort_by: Optional[str] = None, sort_direction: str = 'asc') -> Dict[str, Any]:
        """
        Get a paginated and sorted list of non-deleted classrooms.
        """
        try:
            from_index = (page - 1) * limit
            to_index = from_index + limit - 1

            query = supabase.table('classrooms')\
                .select('id, course_id, class_code, class_name, schedule, start_date, end_date, status', count='exact')\
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
            print(f"Error getting all classrooms: {e}")
            return {'success': False, 'error': str(e), 'data': [], 'total_count': 0}

    @staticmethod
    def get_classroom_by_id(classroom_id: str) -> Dict[str, Any]:
        """
        Get a single non-deleted classroom by ID.
        """
        try:
            response = supabase.table('classrooms')\
                .select('id, course_id, class_code, class_name, schedule, start_date, end_date, status')\
                .eq('id', classroom_id)\
                .is_('deleted_at', 'null')\
                .single()\
                .execute()

            return {'success': True, 'data': response.data}
        except Exception as e:
            print(f"Error getting classroom by ID {classroom_id}: {e}")
            if "JSON object requested, multiple (or no) rows returned" in str(e):
                 return {'success': False, 'error': 'Classroom not found or multiple entries exist'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def create_classroom(classroom_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new classroom.
        Requires 'course_id', 'class_code', 'class_name'.
        """
        if not all(k in classroom_data for k in ('course_id', 'class_code', 'class_name')):
             return {'success': False, 'error': 'Course ID, Class Code, and Class Name are required.'}

        try:
            response = supabase.table('classrooms')\
                .insert(classroom_data)\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 return {'success': False, 'error': 'Failed to create classroom, no data returned.'}

        except Exception as e:
            print(f"Error creating classroom: {e}")
            if 'duplicate key value violates unique constraint' in str(e):
                 if 'classrooms_class_code_key' in str(e): # Giả sử tên constraint
                     return {'success': False, 'error': 'A classroom with this code already exists.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def update_classroom(classroom_id: str, classroom_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing classroom by ID.
        """
        try:
            # Có thể không cho phép cập nhật course_id hoặc class_code?
            # classroom_data.pop('course_id', None)
            # classroom_data.pop('class_code', None)

            response = supabase.table('classrooms')\
                .update(classroom_data)\
                .eq('id', classroom_id)\
                .is_('deleted_at', 'null')\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 # Có thể xảy ra nếu ID không tồn tại hoặc đã bị xóa
                 return {'success': False, 'error': 'Classroom not found or already deleted.'}

        except Exception as e:
            print(f"Error updating classroom {classroom_id}: {e}")
            if 'duplicate key value violates unique constraint' in str(e):
                 if 'classrooms_class_code_key' in str(e):
                     return {'success': False, 'error': 'Another classroom with this code already exists.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def delete_classroom(classroom_id: str) -> Dict[str, Any]:
        """
        Soft delete a classroom by ID (sets deleted_at).
        """
        try:
            # Kiểm tra trước khi xóa
            check = supabase.table('classrooms')\
                      .select('id')\
                      .eq('id', classroom_id)\
                      .is_('deleted_at', 'null')\
                      .maybe_single()\
                      .execute()

            if not check.data:
                 return {'success': False, 'error': 'Classroom not found or already deleted.'}

            # Thực hiện soft delete
            response = supabase.table('classrooms')\
                .update({'deleted_at': 'now()'})\
                .eq('id', classroom_id)\
                .execute()

            if response.data:
                return {'success': True}
            else:
                return {'success': False, 'error': 'Failed to soft delete classroom.'}

        except Exception as e:
            print(f"Error deleting classroom {classroom_id}: {e}")
            return {'success': False, 'error': str(e)}

    # (Tùy chọn) Hàm lấy danh sách lớp học đang hoạt động (tương tự hàm cũ)
    @staticmethod
    def get_active_classrooms() -> Dict[str, Any]:
        """
        Lấy danh sách các lớp học đang hoạt động (status=True).
        """
        try:
            response = supabase.table('classrooms')\
                .select('id, class_code, class_name')\
                .eq('status', True)\
                .is_('deleted_at', 'null')\
                .order('class_name', desc=False)\
                .execute()

            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            print(f"Lỗi khi lấy danh sách lớp học đang hoạt động: {e}")
            return {
                'success': False,
                'error': str(e),
                'data': []
            }