import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Layouts và Components
import IndexLayout from '../../../layouts/IndexLayout';
import StudentTable from '../../../components/admin/ContentTable';
import SortableHeader from '../../../components/admin/SortableHeader';
import PaginationControls from '../../../components/admin/PaginationControls';
import PageSizeSelector from '../../../components/admin/PageSizeSelector';
import PaginationInfo from '../../../components/admin/PaginationInfo';

// Services
import { getAllStudent } from '../../../api/admin/manageStudentService';

// Cấu hình cột cho bảng học viên
const COLUMN_CONFIG = {
  'last_name': { 
    header: 'Họ',
    accessor: 'first_name'
  },
  'first_name': { 
    header: 'Tên',
    accessor: 'last_name'
  },
  'date_of_birth': { 
    header: 'Ngày sinh',
    accessor: 'date_of_birth',
    format: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : 'N/A'
  },
  'gender': {
    header: 'Giới tính',
    accessor: 'gender',
    format: (value) => (value === 1 ? 'Nam' : value === 0 ? 'Nữ' : 'Khác')
  },
  'parent_phone_number': { 
    header: 'SĐT Phụ huynh',
    accessor: 'parent_phone_number'
  },
  'target_jlpt_degree': { 
    header: 'Cấp độ',
    accessor: 'target_jlpt_degree'
  }
};

function Index() {
  const [students, setStudents] = useState([]); // Dữ liệu cho trang hiện tại
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu sau khi tìm kiếm (trên trang hiện tại)
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  

  // === State mới cho phân trang ===
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Số dòng/trang mặc định
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState(''); // State cho tìm kiếm
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // === Hàm xử lý sắp xếp ===
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      // Lấy giá trị từ config cột
      const config = COLUMN_CONFIG[key];
      let aValue = a[key];
      let bValue = b[key];

      // Xử lý giá trị null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Xử lý đặc biệt cho các cột ngày tháng
      if (key === 'date_of_birth' || key === 'target_date') {
        const dateA = aValue ? new Date(aValue).getTime() : 0;
        const dateB = bValue ? new Date(bValue).getTime() : 0;
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // So sánh dựa trên kiểu dữ liệu
      if (typeof aValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Xử lý chuỗi (mặc định)
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(sortedData);
  };

  // === Hàm fetch dữ liệu (dùng useCallback để tối ưu) ===
  const fetchData = useCallback(async (page, limit, currentSearchTerm) => {
    setLoading(true);
    setError(null);
    const { data: apiResponse, error: apiError } = await getAllStudent(page, limit);

    if (apiError) {
      setError(apiError); setLoading(false); return;
    }

    if (apiResponse && apiResponse.results) {
      const apiData = apiResponse.results;
      setTotalCount(apiResponse.count);
      setTotalPages(apiResponse.total_pages);
      setStudents(apiData);

      // 2. SỬA LOGIC TẠO CỘT: Chỉ tạo dựa trên COLUMN_CONFIG
      const generatedColumns = Object.keys(COLUMN_CONFIG).map(key => {
        const config = COLUMN_CONFIG[key];
        return {
          accessor: key,
          header: config.header, 
          format: config.format,
        };
      });
      setColumns(generatedColumns); // Cập nhật state columns

      if (currentSearchTerm) {
        filterLocalData(currentSearchTerm, apiData, generatedColumns); // Truyền columns mới vào
      } else {
        setFilteredData(apiData);
      }

    } else {
      setStudents([]); setFilteredData([]); setTotalCount(0); setTotalPages(0);
    }
    setLoading(false);
  }, []); // Bỏ dependency columns.length

  // === Gọi API khi page hoặc limit thay đổi ===
  useEffect(() => {
    fetchData(currentPage, pageSize, searchTerm);
  }, [currentPage, pageSize, fetchData, searchTerm]); // Thêm searchTerm vào dependency

  // === Hàm lọc dữ liệu trên trang hiện tại ===
  const filterLocalData = (term, dataToFilter, currentColumns) => {
    const lowercasedTerm = term.toLowerCase();
    if (!lowercasedTerm) {
        setFilteredData(dataToFilter); 
        return;
    }
    const filtered = dataToFilter.filter(item => {
        // Dùng currentColumns thay vì state columns (có thể chưa cập nhật kịp)
        return currentColumns.some(col => { 
            const value = item[col.accessor];
            const displayValue = col.format ? col.format(value) : value;
            return String(displayValue).toLowerCase().includes(lowercasedTerm);
        });
    });
    setFilteredData(filtered);
  };

  // === Xử lý tìm kiếm ===
  const handleSearch = (term) => {
    setSearchTerm(term); // Cập nhật state tìm kiếm
    // Việc lọc sẽ tự động diễn ra trong useEffect khi searchTerm thay đổi
    // Hoặc có thể gọi filterLocalData trực tiếp ở đây nếu không muốn useEffect phụ thuộc searchTerm
    filterLocalData(term, students, columns);   
  };

  // === Xử lý thay đổi PageSize ===
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset về trang 1 khi đổi số lượng/trang
  };

  // === Xử lý chuyển trang ===
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // === Các handler khác ===
  const handleAddNew = () => navigate('/admin/students/new'); 
  const handleEdit = (id) => navigate(`/admin/students/edit/${id}`); 
  const handleDelete = (id) => console.log(`Xóa học viên ID: ${id}`);

  return (
    <IndexLayout
      title="Quản lý học viên"
      onAddNew={handleAddNew}
      onSearch={handleSearch}
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
          currentCount={filteredData.length}
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
            <span>Lỗi: {error}</span>
          </div>
        </div>
      )}

      {/* Bảng dữ liệu và điều khiển phân trang */}
      {!loading && !error && (
        <>
          <StudentTable 
            columns={columns}
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentPage={currentPage}
            pageSize={pageSize}
            sortConfig={sortConfig}
            onSort={handleSort}
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
