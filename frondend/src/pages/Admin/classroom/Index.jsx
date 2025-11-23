// frontend/src/pages/admin/student/Index.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Thêm useMemo, useCallback
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Layouts và Components (Đảm bảo đường dẫn đúng)
import IndexLayout from '../../../layouts/IndexLayout';
import ContentTable from '../../../components/Admin/ContentTable';
import PaginationControls from '../../../components/Admin/PaginationControls';
import PageSizeSelector from '../../../components/Admin/PageSizeSelector';
import PaginationInfo from '../../../components/Admin/PaginationInfo';

// Hooks và Services (Đảm bảo đường dẫn đúng)
import { useDataTable } from '../../../hooks/useDataTable'; // Giả sử bạn có hook này
import { getAllClassroom} from '../../../api/admin/manageClassroomService';

// 1. FIX LẠI COLUMN_CONFIG
//    - Đảm bảo keys (`first_name`, `last_name`...) khớp với API response.
//    - Thêm `type` để hỗ trợ hook useDataTable (nếu có).
//    - Sửa lại format giới tính nếu API trả về 0/1.
// COLUMN_CONFIG cho bảng courses
// COLUMN_CONFIG cho bảng classrooms
const COLUMN_CONFIG = {
  'class_code': {
    header: 'Mã lớp',
    type: 'text'
  },
  'class_name': {
    header: 'Tên lớp học',
    type: 'text'
  },
  'course_id': { // Hoặc tên cột chứa tên khóa học nếu có join
    header: 'Thuộc khóa học',
    type: 'text'
    // Format: Có thể cần gọi API khác hoặc join để lấy tên Course từ ID
  },
  'schedule': {
    header: 'Lịch học',
    type: 'text', // Hoặc 'number' nếu chỉ là số
    // Format: Cần logic để chuyển int2 thành text (VD: 1 -> "Thứ 2", 2 -> "Thứ 3")
    // format: (value) => { /* logic chuyển đổi schedule */ } 
  },
  'start_date': {
    header: 'Ngày bắt đầu',
    type: 'date',
    format: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : 'N/A'
  },
  'end_date': {
    header: 'Ngày kết thúc',
    type: 'date',
    format: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : 'N/A'
  },
  'status': {
    header: 'Trạng thái',
    type: 'boolean', // Hoặc 'text' nếu sort theo text đã format
    format: (value) => value ? 'Hoạt động' : 'Đã đóng' // Chuyển boolean thành text
  },
};

function Index() {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState([]); // State lưu dữ liệu gốc từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sử dụng custom hook cho sắp xếp và tìm kiếm (truyền rawData vào)
  const {
    items: filteredAndSortedData, // Dữ liệu đã lọc và sắp xếp bởi hook
    sortConfig,
    handleSort,
    handleSearch // Hook sẽ cung cấp hàm này
  } = useDataTable(rawData, COLUMN_CONFIG); // Truyền rawData gốc

  // Tạo columns từ config (dùng useMemo để tránh tạo lại mỗi lần render)
  const columns = useMemo(() => {
    return Object.keys(COLUMN_CONFIG).map(key => ({
      accessor: key,
      ...COLUMN_CONFIG[key]
    }));
  }, []); // Chỉ tạo lại khi COLUMN_CONFIG thay đổi (thường là không đổi)

  // 2. FIX LẠI HÀM GỌI API TRONG useEffect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Gọi API với page và limit hiện tại
      const { data: apiResponse, error: apiError } = await getAllClassroom(currentPage, pageSize);

      if (apiError) {
        setError(apiError);
        setRawData([]); // Reset data khi có lỗi
        setTotalCount(0);
        setTotalPages(0);
        setLoading(false);
        return;
      }

      // Đảm bảo apiResponse và apiResponse.results tồn tại
      if (apiResponse && apiResponse.results) {
        setRawData(apiResponse.results); // Cập nhật dữ liệu gốc
        setTotalCount(apiResponse.count);
        setTotalPages(apiResponse.total_pages);
      } else {
        // Xử lý trường hợp API trả về cấu trúc không mong đợi hoặc rỗng
        setRawData([]);
        setTotalCount(0);
        setTotalPages(0);
      }
      setLoading(false);
    };

    fetchData();
  }, [currentPage, pageSize]); // Chỉ gọi lại API khi page hoặc size thay đổi

  // Handlers (Giữ nguyên hoặc sửa lại theo logic hook useDataTable)
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset về trang 1
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddNew = () => navigate('/admin/classrooms/new'); 
  const handleEdit = (id) => navigate(`/admin/classrooms/edit/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lớp này?')) {
      return;
    }
    console.log(`Xóa lớp có ID: ${id}`);
    // Thêm logic gọi API xóa và fetch lại dữ liệu nếu thành công
    // Ví dụ:
    // const { error } = await deleteStudent(id);
    // if (!error) {
    //   fetchData(); // Gọi lại fetchData để cập nhật list
    // } else {
    //   setError(error);
    // }
  };

  return (
    <IndexLayout
      title="Quản lý lớp học"
      onAddNew={handleAddNew}
      onSearch={handleSearch} // Truyền hàm search từ hook useDataTable
    >
      {/* Phần điều khiển phân trang */}
      <div className="flex justify-between items-center mb-4">
        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          isDisabled={loading}
        />
        <PaginationInfo
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          currentCountOnPage={filteredAndSortedData.length} // Số lượng hiển thị
          isLoading={loading} // Thêm prop loading
        />
      </div>

      {/* Hiển thị trạng thái loading và lỗi */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Lỗi: {error}</span>
          </div>
        </div>
      )}

      {/* Bảng dữ liệu và điều khiển phân trang */}
      {!loading && !error && (
        <>
          <ContentTable
            columns={columns}
            data={filteredAndSortedData} // Hiển thị dữ liệu đã lọc/sắp xếp
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentPage={currentPage}
            pageSize={pageSize}
            sortConfig={sortConfig} // Truyền config sort từ hook
            onSort={handleSort} // Truyền hàm sort từ hook
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </IndexLayout>
  );
}

export default Index;