"""
Business logic for student operations in admin panel
Handles all Supabase queries for student-related functionality
"""
from config.supabase_client import supabase
from typing import Dict, List, Optional
import uuid
from django.contrib.auth.hashers import make_password
from datetime import date, datetime, timezone
import traceback
import re
import unicodedata


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
    
    @staticmethod
    def get_active_classrooms() -> Dict[str, any]:
        """
        Lấy danh sách các lớp học đang hoạt động.

        Returns:
            Dict: Dictionary chứa 'success' và 'data' (list of classrooms).
        """
        try:            
            # Query bảng 'classrooms' (thay đổi tên bảng nếu cần)
            # Chỉ chọn cột 'id' và 'name' (hoặc code)
            # Thêm điều kiện lọc lớp đang hoạt động nếu có (ví dụ: is_active=True)
            response = supabase.table('classrooms')\
                .select('id, class_code, class_name')\
                .execute()

            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            print(f"Lỗi khi lấy danh sách lớp học: {e}")
            return {
                'success': False,
                'error': str(e),
                'data': []
            }

    @staticmethod
    def _get_next_account_id() -> str:
        try:
            response = supabase.table('account').select('id').execute()
            max_suffix = 0
            if response.data:
                for row in response.data:
                    acc_id = row.get('id')
                    if not acc_id:
                        continue
                    match = re.match(r'^account(\d+)$', acc_id)
                    if match:
                        max_suffix = max(max_suffix, int(match.group(1)))
            next_number = max_suffix + 1 if max_suffix else 1
            return f"account{next_number}"
        except Exception as e:
            print(f"DEBUG: Lỗi khi lấy account id kế tiếp: {e}")
            return f"account{uuid.uuid4().hex[:8]}"

    @staticmethod
    def _sanitize_username(name: str) -> str:
        """
        Lấy tên cuối cùng (first_name) từ họ tên đầy đủ, chuyển về chữ thường và bỏ dấu.
        Ví dụ: "Đỗ Đức Thịnh" -> "thinh", "Ngô Viết Dũng" -> "dung"
        """
        if not name:
            return ''
        # Tách thành các từ và lấy từ cuối cùng (first_name)
        name_parts = name.strip().split()
        if not name_parts:
            return ''
        
        # Lấy từ cuối cùng (first_name)
        first_name = name_parts[-1]
        
        # Chuyển về chữ thường và bỏ dấu
        normalized = unicodedata.normalize('NFKD', first_name)
        ascii_name = ''.join(c for c in normalized if not unicodedata.combining(c))
        ascii_name = re.sub(r'[^A-Za-z0-9]', '', ascii_name)
        return ascii_name.lower()

    @staticmethod
    def _generate_suffix_from_samurai_id(samurai_id: Optional[str] = None) -> str:
        """
        Tạo suffix 4 chữ số từ mã học viên (samurai_student_id).
        Ví dụ: "2025N30701-20" -> "0720", "2025N11201-21" -> "1221"
        Logic: Lấy 2 chữ số giữa của số lớn và 2 chữ số cuối của số nhỏ
        """
        if samurai_id:
            # Tìm các số trong mã học viên
            numbers = re.findall(r'\d+', samurai_id)
            if len(numbers) >= 2:
                try:
                    # Tìm số lớn nhất (thường là số giữa như 30701, 11201)
                    # và số cuối cùng (như 20, 21)
                    mid_num = numbers[-2]  # Số giữa (30701, 11201)
                    last_num = numbers[-1]  # Số cuối (20, 21)
                    
                    # Lấy 2 chữ số giữa của mid_num
                    # "30701" (5 chữ số) -> lấy "07" (vị trí 2,3 từ trái sang)
                    # "11201" (5 chữ số) -> lấy "12" (vị trí 1,2 từ trái sang)
                    if len(mid_num) == 5:
                        # Với số 5 chữ số: thử các vị trí và chọn phần hợp lý nhất
                        # "30701": vị trí 1,2 = "30", vị trí 2,3 = "07", vị trí 3,4 = "70"
                        # "11201": vị trí 1,2 = "12", vị trí 2,3 = "20", vị trí 3,4 = "01"
                        # Logic: ưu tiên phần không phải "00" và không phải số lớn hơn 30 ở đầu
                        part_12 = mid_num[1:3]  # Vị trí 1,2
                        part_23 = mid_num[2:4]  # Vị trí 2,3
                        part_34 = mid_num[3:5]  # Vị trí 3,4
                        
                        # Ưu tiên vị trí 1,2 nếu không phải "00" và không quá lớn
                        if part_12 != '00' and int(part_12) < 30:
                            mid_part = part_12
                        elif part_23 != '00':
                            mid_part = part_23
                        elif part_34 != '00':
                            mid_part = part_34
                        else:
                            mid_part = part_23
                    elif len(mid_num) >= 3:
                        # Với số có độ dài khác: lấy 2 chữ số ở giữa
                        mid_start = len(mid_num) // 2 - 1
                        mid_part = mid_num[mid_start:mid_start + 2]
                    else:
                        mid_part = mid_num[-2:] if len(mid_num) >= 2 else mid_num.zfill(2)
                    
                    # Lấy 2 chữ số cuối của last_num
                    last_part = last_num[-2:] if len(last_num) >= 2 else last_num.zfill(2)
                    
                    suffix = mid_part + last_part
                    if len(suffix) == 4:
                        return suffix
                except Exception as e:
                    print(f"DEBUG: Lỗi khi tạo suffix từ mã học viên: {e}")
                    pass
        
        # Nếu không tạo được từ mã học viên, tạo số ngẫu nhiên 4 chữ số
        import random
        return f"{random.randint(1000, 9999)}"
    
    @staticmethod
    def _ensure_unique_username(base_username: str, samurai_id: Optional[str] = None) -> str:
        """
        Tạo username unique bằng cách thêm suffix 4 chữ số.
        Ví dụ: "thinh" -> "thinh0720", "dung" -> "dung0720"
        """
        base_username = base_username or 'student'
        
        # Tạo suffix từ mã học viên hoặc ngẫu nhiên
        suffix = StudentService._generate_suffix_from_samurai_id(samurai_id)
        username = f"{base_username}{suffix}"
        
        # Kiểm tra unique, nếu trùng thì thử số khác
        max_attempts = 100
        attempt = 0
        while attempt < max_attempts:
            try:
                existing = supabase.table('account').select('id').eq('user_name', username).execute()
                if not existing.data:
                    return username
            except Exception as e:
                print(f"DEBUG: Lỗi kiểm tra username: {e}")
                return username
            
            # Nếu trùng, tạo suffix mới
            import random
            suffix = f"{random.randint(1000, 9999)}"
            username = f"{base_username}{suffix}"
            attempt += 1
        
        # Nếu vẫn không được sau nhiều lần thử, dùng counter như cũ
        counter = 1
        while True:
            try:
                username = f"{base_username}{counter}"
                existing = supabase.table('account').select('id').eq('user_name', username).execute()
                if not existing.data:
                    return username
            except Exception as e:
                print(f"DEBUG: Lỗi kiểm tra username: {e}")
                return username
            counter += 1
    
    @staticmethod
    def create_account_for_student(account_data: Dict, fallback_name: Optional[str] = None, samurai_id: Optional[str] = None) -> Dict[str, any]:
        """
        Tạo tài khoản cho học viên.
        
        Args:
            account_data: Dict chứa thông tin tài khoản (user_name, password, email, phone_number)
        
        Returns:
            Dict: Dictionary chứa 'success', 'data' (account_id) hoặc 'error'.
        """
        try:
            # Validate dữ liệu đầu vào
            if not account_data.get('password'):
                return {
                    'success': False,
                    'error': 'Password không được để trống.'
                }

            raw_username = (account_data.get('user_name') or '').strip()
            if not raw_username and fallback_name:
                # Lấy first_name từ fallback_name (họ tên đầy đủ)
                raw_username = StudentService._sanitize_username(fallback_name)
            if not raw_username and samurai_id:
                raw_username = StudentService._sanitize_username(samurai_id)
            if not raw_username:
                raw_username = 'student'

            # Tạo username unique với suffix từ mã học viên
            username = StudentService._ensure_unique_username(raw_username, samurai_id)

            # Tạo ID cho account theo dạng account<number>
            account_id = StudentService._get_next_account_id()
            
            # Hash password bằng Argon2
            hashed_password = make_password(account_data['password'])
            
            # Chuẩn bị dữ liệu account
            account_insert_data = {
                'id': account_id,
                'user_name': username,
                'password': hashed_password,
            }
            
            # Thêm email và phone_number nếu có
            if account_data.get('email'):
                account_insert_data['email'] = account_data['email']
            if account_data.get('phone_number'):
                account_insert_data['phone_number'] = account_data['phone_number']

            now_iso = datetime.now(timezone.utc).isoformat()
            account_insert_data['created_at'] = now_iso
            account_insert_data['updated_at'] = now_iso
            
            # Insert vào bảng account
            response = supabase.table('account')\
                .insert(account_insert_data)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return {
                    'success': True,
                    'data': {'account_id': account_id}
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to create account, no data returned.'
                }
        except Exception as e:
            print(f"Lỗi khi tạo tài khoản: {e}")
            print(f"Traceback: {traceback.format_exc()}")  # Debug log
            # Xử lý lỗi trùng lặp
            error_str = str(e)
            if 'duplicate key value violates unique constraint' in error_str:
                if 'account_user_name_key' in error_str:
                    return {'success': False, 'error': 'Username already exists.'}
                elif 'account_email_key' in error_str:
                    return {'success': False, 'error': 'Email already exists.'}
                elif 'account_phone_number_key' in error_str:
                    return {'success': False, 'error': 'Phone number already exists.'}
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def _check_samurai_student_id_exists(samurai_student_id: str) -> bool:
        """
        Kiểm tra xem samurai_student_id đã tồn tại trong database chưa.
        
        Args:
            samurai_student_id: Mã học viên cần kiểm tra
            
        Returns:
            bool: True nếu đã tồn tại, False nếu chưa tồn tại
        """
        if not samurai_student_id:
            return False
        
        try:
            response = supabase.table('students')\
                .select('id')\
                .eq('samurai_student_id', samurai_student_id)\
                .is_('deleted_at', 'null')\
                .execute()
            
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            print(f"DEBUG: Lỗi khi kiểm tra samurai_student_id: {e}")
            # Nếu có lỗi, trả về False để tiếp tục xử lý (an toàn hơn)
            return False
    
    @staticmethod
    def bulk_create_students_from_excel(students_data: List[Dict]) -> Dict[str, any]:
        """
        Tạo hàng loạt học viên từ dữ liệu Excel.
        
        Args:
            students_data: List các dict chứa thông tin học viên từ Excel
        
        Returns:
            Dict: Dictionary chứa 'success', 'data' (list created students), 
                  'errors' (list errors), 'total', 'success_count', 'error_count'.
        """
        results = {
            'success': True,
            'data': [],
            'errors': [],
            'total': len(students_data),
            'success_count': 0,
            'error_count': 0
        }
        
        for index, student_data in enumerate(students_data, start=2):  # start=2 vì Excel bắt đầu từ row 2
            account_id = None  # Khai báo trước để có thể dùng trong except
            try:
                
                # Kiểm tra samurai_student_id đã tồn tại chưa
                samurai_id = student_data.get('samurai_student_id')
                if samurai_id:
                    if StudentService._check_samurai_student_id_exists(samurai_id):
                        error_msg = f"Mã học viên '{samurai_id}' đã tồn tại trong hệ thống."
                        print(f"DEBUG: {error_msg}")  # Debug log
                        results['errors'].append({
                            'row': index,
                            'samurai_student_id': samurai_id,
                            'error': error_msg
                        })
                        results['error_count'] += 1
                        continue
                
                # 1. Tạo tài khoản trước
                account_data = {
                    'user_name': student_data.get('user_name'),
                    'password': student_data.get('password', ''),
                    'email': student_data.get('email'),
                    'phone_number': student_data.get('phone_number'),
                }
                # Lấy tên đầy đủ để tạo username (ghép first_name và last_name)
                full_name = f"{student_data.get('last_name', '')} {student_data.get('first_name', '')}".strip()
                if not full_name:
                    full_name = student_data.get('first_name') or student_data.get('last_name') or ''
                samurai_id = student_data.get('samurai_student_id')
                
                account_result = StudentService.create_account_for_student(account_data, full_name, samurai_id)
                
                if not account_result['success']:
                    error_msg = f"Tạo tài khoản thất bại: {account_result['error']}"
                    print(f"DEBUG: {error_msg}")  # Debug log
                    results['errors'].append({
                        'row': index,
                        'samurai_student_id': student_data.get('samurai_student_id', 'N/A'),
                        'error': error_msg
                    })
                    results['error_count'] += 1
                    continue
                
                account_id = account_result['data']['account_id']
                
                # 2. Tạo học viên (id sẽ được trigger tự động sinh)
                student_insert_data = {
                    'classroom_code': student_data.get('classroom_code'),
                    'account_id': account_id,
                    'first_name': student_data.get('first_name'),
                    'last_name': student_data.get('last_name'),
                    'samurai_student_id': student_data.get('samurai_student_id'),
                    'date_of_birth': student_data.get('date_of_birth'),
                    'gender': student_data.get('gender'),
                    'address': student_data.get('address'),
                    'parent_phone_number': student_data.get('parent_phone_number'),
                }
                
                # Loại bỏ các trường None hoặc rỗng
                student_insert_data = {k: v for k, v in student_insert_data.items() if v is not None and v != ''}

                # Chuyển kiểu ngày sang ISO string để JSON serializable
                if 'date_of_birth' in student_insert_data and isinstance(student_insert_data['date_of_birth'], (date, datetime)):
                    student_insert_data['date_of_birth'] = student_insert_data['date_of_birth'].isoformat()

                now_iso = datetime.now(timezone.utc).isoformat()
                student_insert_data['created_at'] = now_iso
                student_insert_data['updated_at'] = now_iso
                
                # Insert vào bảng students (id sẽ được trigger tự động sinh)
                student_response = supabase.table('students')\
                    .insert(student_insert_data)\
                    .execute()
                if student_response.data and len(student_response.data) > 0:
                    results['data'].append(student_response.data[0])
                    results['success_count'] += 1
                else:
                    # Nếu tạo student thất bại, cần xóa account đã tạo
                    try:
                        supabase.table('account').delete().eq('id', account_id).execute()
                        print(f"DEBUG: Đã xóa account {account_id} do tạo student thất bại")  # Debug log
                    except Exception as del_error:
                        print(f"DEBUG: Lỗi khi xóa account: {del_error}")  # Debug log
                    
                    error_msg = 'Tạo học viên thất bại, không có dữ liệu trả về.'
                    print(f"DEBUG: {error_msg}")  # Debug log
                    results['errors'].append({
                        'row': index,
                        'samurai_student_id': student_data.get('samurai_student_id', 'N/A'),
                        'error': error_msg
                    })
                    results['error_count'] += 1
                    
            except Exception as e:
                print(f"DEBUG: Exception khi xử lý row {index}: {e}")  # Debug log
                print(f"DEBUG: Traceback: {traceback.format_exc()}")  # Debug log
                
                # Nếu có lỗi, cố gắng xóa account đã tạo (nếu có)
                if account_id:
                    try:
                        supabase.table('account').delete().eq('id', account_id).execute()
                        print(f"DEBUG: Đã xóa account {account_id} do exception")  # Debug log
                    except Exception as del_error:
                        print(f"DEBUG: Lỗi khi xóa account trong exception: {del_error}")  # Debug log
                
                results['errors'].append({
                    'row': index,
                    'samurai_student_id': student_data.get('samurai_student_id', 'N/A'),
                    'error': str(e)
                })
                results['error_count'] += 1
        
        # Nếu có lỗi, đánh dấu success = False
        if results['error_count'] > 0:
            results['success'] = False
        
        return results

