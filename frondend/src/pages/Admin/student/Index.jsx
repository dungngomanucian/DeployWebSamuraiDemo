import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Layouts và Components
import IndexLayout from '../../../layouts/IndexLayout';
import StudentTable from '../../../components/admin/ContentTable';
import PaginationControls from '../../../components/admin/PaginationControls';
import PageSizeSelector from '../../../components/admin/PageSizeSelector';
import PaginationInfo from '../../../components/admin/PaginationInfo';

// Hooks và Services
import { useDataTable } from '../../../hooks/useDataTable';
import { getAllStudent } from '../../../api/admin/manageStudentService';

// Cấu hình cột cho bảng học viên
const COLUMN_CONFIG = {
  'last_name': { 
    header: 'Họ',
    type: 'string'
  },
  'first_name': { 
    header: 'Tên',
    type: 'string'
  },
  'date_of_birth': { 
    header: 'Ngày sinh',
    type: 'date',
    format: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : 'N/A'
  },
  'gender': {
    header: 'Giới tính',
    type: 'number',
    format: (value) => (value === 1 ? 'Nam' : value === 0 ? 'Nữ' : 'Khác')
  },
  'parent_phone_number': { 
    header: 'SĐT Phụ huynh',
    type: 'string'
  },
  'target_jlpt_degree': { 
    header: 'Cấp độ',
    type: 'string'
  }
};

function Index() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sử dụng custom hook cho sắp xếp và tìm kiếm
  const {
    items: filteredData,
    sortConfig,
    handleSort,
    handleSearch
  } = useDataTable(students, COLUMN_CONFIG);

  // Tạo columns cho bảng từ config
  const columns = Object.keys(COLUMN_CONFIG).map(key => ({
    accessor: key,
    ...COLUMN_CONFIG[key]
  }));

  // Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { data: apiResponse, error: apiError } = await getAllStudent(currentPage, pageSize);

      if (apiError) {
        setError(apiError);
        setLoading(false);
        return;
      }

      if (apiResponse && apiResponse.results) {
        setStudents(apiResponse.results);
        setTotalCount(apiResponse.count);
        setTotalPages(apiResponse.total_pages);
      } else {
        setStudents([]);
        setTotalCount(0);
        setTotalPages(0);
      }
      setLoading(false);
    };

    fetchData();
  }, [currentPage, pageSize]);

  // Handlers
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddNew = () => navigate('/admin/students/new');
  const handleEdit = (id) => navigate(`/admin/students/edit/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa học viên này?')) {
      return;
    }
    // Thêm logic xóa ở đây
    console.log(`Xóa học viên ID: ${id}`);
  };

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
