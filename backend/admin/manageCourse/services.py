# course/services.py
from config.supabase_client import supabase # Import supabase instance
from typing import Dict, List, Optional, Any
import math

class CourseService:
    """Service layer for handling course operations"""

    @staticmethod
    def get_all_courses(page: int = 1, limit: int = 10, sort_by: Optional[str] = None, sort_direction: str = 'asc') -> Dict[str, Any]:
        """
        Get a paginated and sorted list of non-deleted courses.
        """
        try:
            from_index = (page - 1) * limit
            to_index = from_index + limit - 1

            query = supabase.table('courses')\
                .select('id, name, description, short_des, image_path', count='exact')\
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
            print(f"Error getting all courses: {e}")
            return {'success': False, 'error': str(e), 'data': [], 'total_count': 0}

    @staticmethod
    def get_course_by_id(course_id: str) -> Dict[str, Any]:
        """
        Get a single non-deleted course by ID.
        """
        try:
            response = supabase.table('courses')\
                .select('id, name, description, short_des, image_path')\
                .eq('id', course_id)\
                .is_('deleted_at', 'null')\
                .single()\
                .execute()

            return {'success': True, 'data': response.data}
        except Exception as e:
            print(f"Error getting course by ID {course_id}: {e}")
            if "JSON object requested, multiple (or no) rows returned" in str(e):
                 return {'success': False, 'error': 'Course not found or multiple entries exist'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def create_course(course_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new course.
        Requires 'name'.
        """
        if not course_data.get('name'):
             return {'success': False, 'error': 'Course Name is required.'}

        try:
            # Xử lý upload ảnh nếu cần (nên làm ở View hoặc Serializer trước khi gọi service)
            # Ví dụ: upload file lên Supabase Storage rồi lấy path lưu vào course_data['image_path']

            response = supabase.table('courses')\
                .insert(course_data)\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 return {'success': False, 'error': 'Failed to create course, no data returned.'}

        except Exception as e:
            print(f"Error creating course: {e}")
            if 'duplicate key value violates unique constraint' in str(e):
                 # Giả sử tên khóa học là unique
                 if 'courses_name_key' in str(e): # Giả sử tên constraint
                     return {'success': False, 'error': 'A course with this name already exists.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def update_course(course_id: str, course_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing course by ID.
        """
        try:
            # Xử lý upload ảnh mới nếu có

            response = supabase.table('courses')\
                .update(course_data)\
                .eq('id', course_id)\
                .is_('deleted_at', 'null')\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 # Có thể xảy ra nếu ID không tồn tại hoặc đã bị xóa
                 return {'success': False, 'error': 'Course not found or already deleted.'}

        except Exception as e:
            print(f"Error updating course {course_id}: {e}")
            if 'duplicate key value violates unique constraint' in str(e):
                 if 'courses_name_key' in str(e):
                     return {'success': False, 'error': 'Another course with this name already exists.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def delete_course(course_id: str) -> Dict[str, Any]:
        """
        Soft delete a course by ID (sets deleted_at).
        """
        try:
            # Kiểm tra trước khi xóa
            check = supabase.table('courses')\
                      .select('id')\
                      .eq('id', course_id)\
                      .is_('deleted_at', 'null')\
                      .maybe_single()\
                      .execute()

            if not check.data:
                 return {'success': False, 'error': 'Course not found or already deleted.'}

            # Thực hiện soft delete
            response = supabase.table('courses')\
                .update({'deleted_at': 'now()'})\
                .eq('id', course_id)\
                .execute()

            if response.data:
                return {'success': True}
            else:
                return {'success': False, 'error': 'Failed to soft delete course.'}

        except Exception as e:
            print(f"Error deleting course {course_id}: {e}")
            return {'success': False, 'error': str(e)}