# level/services.py
from config.supabase_client import supabase # Import supabase instance
from typing import Dict, List, Optional, Any
import math

class LevelService:
    """Service layer for handling level operations"""

    @staticmethod
    def get_all_levels(page: int = 1, limit: int = 10, sort_by: Optional[str] = None, sort_direction: str = 'asc') -> Dict[str, Any]:
        """
        Get a paginated and sorted list of non-deleted levels.
        """
        try:
            from_index = (page - 1) * limit
            to_index = from_index + limit - 1

            query = supabase.table('levels')\
                .select('id, title, description', count='exact')\
                .is_('deleted_at', 'null')

            if sort_by:
                if sort_direction.lower() == 'desc':
                    query = query.order(sort_by, desc=True) # Dùng desc=True cho giảm dần
                else:
                    query = query.order(sort_by) # Mặc định là tăng dần, không cần thêm gì
            else:
                # Sắp xếp mặc định theo title tăng dần
                query = query.order('title') 

            response = query.range(from_index, to_index).execute()

            return {
                'success': True,
                'data': response.data,
                'total_count': response.count
            }
        except Exception as e:
            print(f"Error getting all levels: {e}")
            return {'success': False, 'error': str(e), 'data': [], 'total_count': 0}

    @staticmethod
    def get_level_by_id(level_id: str) -> Dict[str, Any]:
        """
        Get a single non-deleted level by ID.
        """
        try:
            response = supabase.table('levels')\
                .select('id, title, description')\
                .eq('id', level_id)\
                .is_('deleted_at', 'null')\
                .single()\
                .execute()

            return {'success': True, 'data': response.data}
        except Exception as e:
            print(f"Error getting level by ID {level_id}: {e}")
            if "JSON object requested, multiple (or no) rows returned" in str(e):
                 return {'success': False, 'error': 'Level not found or multiple entries exist'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def create_level(level_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new level.
        Requires 'title'.
        """
        if not level_data.get('title'):
             return {'success': False, 'error': 'Level Title is required.'}

        try:
            response = supabase.table('levels')\
                .insert(level_data)\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 return {'success': False, 'error': 'Failed to create level, no data returned.'}

        except Exception as e:
            print(f"Error creating level: {e}")
            if 'duplicate key value violates unique constraint' in str(e):
                 if 'levels_title_key' in str(e): # Giả sử tên constraint
                     return {'success': False, 'error': 'A level with this title already exists.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def update_level(level_id: str, level_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing level by ID.
        """
        try:
            response = supabase.table('levels')\
                .update(level_data)\
                .eq('id', level_id)\
                .is_('deleted_at', 'null')\
                .execute()

            if response.data and len(response.data) > 0:
                 return {'success': True, 'data': response.data[0]}
            else:
                 # Có thể xảy ra nếu ID không tồn tại hoặc đã bị xóa
                 return {'success': False, 'error': 'Level not found or already deleted.'}

        except Exception as e:
            print(f"Error updating level {level_id}: {e}")
            if 'duplicate key value violates unique constraint' in str(e):
                 if 'levels_title_key' in str(e):
                     return {'success': False, 'error': 'Another level with this title already exists.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def delete_level(level_id: str) -> Dict[str, Any]:
        """
        Soft delete a level by ID (sets deleted_at).
        """
        try:
            # Kiểm tra trước khi xóa
            check = supabase.table('levels')\
                      .select('id')\
                      .eq('id', level_id)\
                      .is_('deleted_at', 'null')\
                      .maybe_single()\
                      .execute()

            if not check.data:
                 return {'success': False, 'error': 'Level not found or already deleted.'}

            # Thực hiện soft delete
            response = supabase.table('levels')\
                .update({'deleted_at': 'now()'})\
                .eq('id', level_id)\
                .execute()

            if response.data:
                return {'success': True}
            else:
                return {'success': False, 'error': 'Failed to soft delete level.'}

        except Exception as e:
            print(f"Error deleting level {level_id}: {e}")
            return {'success': False, 'error': str(e)}