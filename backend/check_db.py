import psycopg2
from psycopg2 import OperationalError

# Thông tin kết nối từ biến môi trường của bạn
DB_HOST = "db.oreasnlyzhaeteipyylw.supabase.co"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "Utc@20032025OK"
DB_PORT = "5432"

# 1. Hàm kiểm tra kết nối
def check_connection():
    conn = None
    try:
        # Thử thiết lập kết nối
        print("Đang cố gắng kết nối tới database...")
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        print("✅ Kết nối database thành công!")
        return conn
    except OperationalError as e:
        # Báo lỗi nếu kết nối thất bại
        print(f"❌ Kết nối database thất bại: {e}")
        print("Vui lòng kiểm tra lại:")
        print("1. Database Supabase có đang hoạt động không.")
        print("2. Tường lửa (Firewall) hoặc cài đặt mạng có chặn cổng 5432 không.")
        print("3. Thông tin HOST, PORT, USER, PASSWORD đã đúng chưa.")
        return None

# 2. Hàm thực hiện truy vấn và in kết quả
def execute_query_and_print(conn):
    if conn is None:
        return

    # Câu truy vấn SQL: Giả sử bạn có một bảng tên là 'users'
    # Bạn cần thay đổi 'users' bằng tên bảng thực tế của bạn (ví dụ: accounts_customuser)
    # và 'email' bằng tên cột email thực tế trong bảng đó.
    QUERY = "SELECT * FROM users WHERE email = 'honda.sensei@samurai.edu';"
    
    # Thay 'users' bằng tên bảng thực tế của bạn
    TABLE_NAME = "users" 

    cursor = conn.cursor()
    try:
        print(f"\nĐang thực hiện truy vấn trong bảng '{TABLE_NAME}'...")
        cursor.execute(QUERY)
        
        # Lấy tất cả các hàng dữ liệu
        records = cursor.fetchall()
        
        # Lấy tên các cột
        column_names = [desc[0] for desc in cursor.description]

        if records:
            print(f"✅ Tìm thấy {len(records)} bản ghi:")
            print("-" * 30)
            print(f"Cột: {column_names}")
            for row in records:
                print(f"Dữ liệu: {row}")
            print("-" * 30)
        else:
            print("⚠️ Không tìm thấy bản ghi nào với email 'honda.sensei@samurai.edu'.")

    except Exception as e:
        print(f"❌ Lỗi trong quá trình truy vấn: {e}")
    finally:
        # Đóng con trỏ
        cursor.close()

# 3. Thực thi chính
if __name__ == "__main__":
    connection = check_connection()
    
    if connection:
        execute_query_and_print(connection)
        
        # Đóng kết nối sau khi hoàn tất
        connection.close()
        print("\nĐã đóng kết nối database.")