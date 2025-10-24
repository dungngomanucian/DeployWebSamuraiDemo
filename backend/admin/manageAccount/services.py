# account/services.py
from config.supabase_client import supabase # Import supabase instance
from typing import Dict, List, Optional, Any
import math

# (Tùy chọn) Import thư viện hash password nếu cần
# from django.contrib.auth.hashers import make_password, check_password

class AccountService:
    """Service layer for handling account operations"""

    @staticmethod
    def get_all_accounts(page: int = 1, limit: int = 10, sort_by: Optional[str] = None, sort_direction: str = 'asc') -> Dict[str, Any]:
        """
        Get a paginated and sorted list of non-deleted accounts.
        """
        try:
            from_index = (page - 1) * limit
            to_index = from_index + limit - 1
            
            query = supabase.table('account')\
                .select('id, user_name, phone_number, email, image_path', count='exact')\
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
            print(f"Error getting all accounts: {e}")
            return {'success': False, 'error': str(e), 'data': [], 'total_count': 0}

    @staticmethod
    def get_account_by_id(account_id: str) -> Dict[str, Any]:
        """
        Get a single non-deleted account by its ID.
        """
        try:
            response = supabase.table('account')\
                .select('id, user_name, phone_number, email, image_path')\
                .eq('id', account_id)\
                .is_('deleted_at', 'null')\
                .single()\
                .execute()
            
            return {'success': True, 'data': response.data}
        except Exception as e:
            # PostgREST/Supabase trả về lỗi cụ thể nếu không tìm thấy hoặc tìm thấy nhiều hơn 1 khi dùng .single()
            print(f"Error getting account by ID {account_id}: {e}")
            # Trả về lỗi rõ ràng hơn nếu có thể
            if "JSON object requested, multiple (or no) rows returned" in str(e):
                 return {'success': False, 'error': 'Account not found or multiple accounts exist with this ID'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def create_account(account_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new account. Assumes password hashing happens before calling this.
        """
        try:
            # (Quan trọng) Nếu cần hash password, nên làm ở Serializer hoặc View trước khi gọi service
            # Ví dụ: account_data['password'] = make_password(account_data['password'])
            
            response = supabase.table('account')\
                .insert(account_data)\
                .execute()

            # Insert trả về data là list chứa object vừa tạo
            if response.data and len(response.data) > 0:
                 created_account = response.data[0]
                 # Xóa password khỏi dữ liệu trả về
                 created_account.pop('password', None) 
                 return {'success': True, 'data': created_account}
            else:
                 # Trường hợp insert không thành công mà không báo lỗi rõ ràng (hiếm)
                 return {'success': False, 'error': 'Failed to create account, no data returned.'}

        except Exception as e:
            print(f"Error creating account: {e}")
            # Kiểm tra lỗi trùng lặp (ví dụ: email, user_name)
            if 'duplicate key value violates unique constraint' in str(e):
                 # Cần xác định rõ constraint nào bị vi phạm từ lỗi chi tiết
                 if 'account_user_name_key' in str(e):
                      return {'success': False, 'error': 'Username already exists.'}
                 elif 'account_email_key' in str(e):
                      return {'success': False, 'error': 'Email already exists.'}
                 elif 'account_phone_number_key' in str(e):
                     return {'success': False, 'error': 'Phone number already exists.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def update_account(account_id: str, account_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing account by ID. Assumes password hashing happens before calling this if password is updated.
        """
        try:
             # (Quan trọng) Xử lý hash password nếu 'password' có trong account_data
             # if 'password' in account_data and account_data['password']:
             #     account_data['password'] = make_password(account_data['password'])
             # elif 'password' in account_data:
             #     # Xóa key password nếu giá trị rỗng để tránh ghi đè pass cũ thành rỗng
             #     del account_data['password'] 

            response = supabase.table('account')\
                .update(account_data)\
                .eq('id', account_id)\
                .is_('deleted_at', 'null')\
                .execute()

            if response.data and len(response.data) > 0:
                 updated_account = response.data[0]
                 updated_account.pop('password', None) # Xóa password khỏi response
                 return {'success': True, 'data': updated_account}
            else:
                 # Có thể xảy ra nếu ID không tồn tại hoặc đã bị xóa (do is_('deleted_at', 'null'))
                 return {'success': False, 'error': 'Account not found or already deleted.'}

        except Exception as e:
            print(f"Error updating account {account_id}: {e}")
            # Xử lý lỗi trùng lặp tương tự như create
            if 'duplicate key value violates unique constraint' in str(e):
                 if 'account_user_name_key' in str(e):
                      return {'success': False, 'error': 'Username already exists.'}
                 elif 'account_email_key' in str(e):
                      return {'success': False, 'error': 'Email already exists.'}
                 elif 'account_phone_number_key' in str(e):
                     return {'success': False, 'error': 'Phone number already exists.'}
            return {'success': False, 'error': str(e)}

    @staticmethod
    def delete_account(account_id: str) -> Dict[str, Any]:
        """
        Soft delete an account by ID (sets deleted_at).
        """
        try:
            # Kiểm tra xem account có tồn tại và chưa bị xóa không trước khi update
            check = supabase.table('account')\
                      .select('id')\
                      .eq('id', account_id)\
                      .is_('deleted_at', 'null')\
                      .maybe_single()\
                      .execute()

            if not check.data:
                 return {'success': False, 'error': 'Account not found or already deleted.'}

            # Thực hiện soft delete
            response = supabase.table('account')\
                .update({'deleted_at': 'now()'})\
                .eq('id', account_id)\
                .execute()

            # Update thành công thường trả về data (dù có thể không cần)
            if response.data:
                return {'success': True}
            else:
                # Có thể xảy ra nếu có lỗi mạng giữa check và update
                return {'success': False, 'error': 'Failed to soft delete account.'}

        except Exception as e:
            print(f"Error deleting account {account_id}: {e}")
            return {'success': False, 'error': str(e)}