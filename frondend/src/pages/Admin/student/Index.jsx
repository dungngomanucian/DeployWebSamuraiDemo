// frontend/src/pages/admin/ManageStudents.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import { useNavigate } from 'react-router-dom';
import IndexLayout from '../../../layouts/IndexLayout';
import StudentTable from '../../../components/admin/ContentTable';       
import PaginationControls from '../../../components/admin/PaginationControls';
import { HiPencil, HiTrash } from "react-icons/hi2";
import { getAllStudent } from '../../../api/admin/manageStudentService';
import { format } from 'date-fns';

// Config cột giữ nguyên
const COLUMN_CONFIG = {
    'first_name': { header: 'Họ' },
    'last_name': { header: 'Tên' },
    'date_of_birth': { 
      header: 'Ngày sinh',
      format: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : 'N/A'
    },
    'gender': {
      header: 'Giới tính',
      format: (value) => (value === 1 ? 'Nam' : value === 2 ? 'Nữ' : 'Khác')
    },
    'parent_phone_number': { header: 'SĐT Phụ huynh' },
    'target_jlpt_degree': { header: 'Cấp độ' },
};

export default function ManageStudents() {
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
  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
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
        {/* === UI Controls Phân trang === */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <label htmlFor="pageSize" className="mr-2 text-sm">Hiển thị:</label>
            <select 
              id="pageSize" 
              value={pageSize} 
              onChange={handlePageSizeChange}
              className="select select-bordered select-sm"
              disabled={loading}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
            <span className="ml-2 text-sm">bản ghi/trang</span>
          </div>
          <span className="text-sm">
            Hiển thị {filteredData.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-
            {Math.min(currentPage * pageSize, totalCount)} trên tổng số {totalCount} bản ghi
          </span>
        </div>

        {/* === Hiển thị Loading/Error === */}
        {loading && ( <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg"></span></div> )}
        {error && ( <div className="alert alert-error shadow-lg">...</div> )}

        {/* === Gọi Component Bảng và Phân trang === */}
        {!loading && !error && (
          <>
            <StudentTable 
              columns={columns}
              data={filteredData}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentPage={currentPage}
              pageSize={pageSize}
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