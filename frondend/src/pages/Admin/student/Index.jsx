// frontend/src/pages/admin/ManageStudents.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import { useNavigate } from 'react-router-dom';
import IndexLayout from '../../../layouts/IndexLayout';
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
      onSearch={handleSearch} // Truyền hàm handleSearch mới
    >
      {/* === UI Controls Phân trang === */}
      <div className="flex justify-between items-center mb-4">
        {/* Dropdown chọn PageSize */}
        <div>
          <label htmlFor="pageSize" className="mr-2 text-sm">Hiển thị:</label>
          <select 
            id="pageSize" 
            value={pageSize} 
            onChange={handlePageSizeChange}
            className="select select-bordered select-sm"
            disabled={loading} // Disable khi đang tải
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
          <span className="ml-2 text-sm">bản ghi/trang</span>
        </div>

        {/* Thông tin số lượng bản ghi */}
        <span className="text-sm">
          Hiển thị {filteredData.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-
          {Math.min(currentPage * pageSize, totalCount)} trên tổng số {totalCount} bản ghi
        </span>
      </div>

      {/* === Hiển thị Loading/Error/Bảng === */}
      {loading && (
        <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg"></span></div>
      )}
      {error && (
        <div className="alert alert-error shadow-lg">...</div> // Giữ nguyên
      )}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra">{/* Thêm table-zebra cho đẹp */}
            <thead>
              <tr>
                <th>#</th>
                {columns.map((col) => (
                  <th key={col.accessor}>{col.header}</th>
                ))}
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                 filteredData.map((row, index) => (
                    <tr key={row.id} className="hover">
                      {/* Tính số thứ tự đúng theo trang */}
                      <th>{((currentPage - 1) * pageSize) + index + 1}</th> 
                      {columns.map((col) => (
                        <td key={col.accessor}>
                          {col.format ? col.format(row[col.accessor]) : row[col.accessor]}
                        </td>
                      ))}
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(row.id)} className="btn btn-sm btn-outline btn-info"><HiPencil /></button>
                          <button onClick={() => handleDelete(row.id)} className="btn btn-sm btn-outline btn-error"><HiTrash /></button>
                        </div>
                      </td>
                    </tr>
                 ))
              ) : (
                <tr>
                    <td colSpan={columns.length + 2} className="text-center p-4">Không tìm thấy dữ liệu phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* === Component Phân trang (Pagination) === */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button 
              className="join-item btn btn-sm" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button className="join-item btn btn-sm">
              Trang {currentPage} / {totalPages}
            </button>
            <button 
              className="join-item btn btn-sm" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}
    </IndexLayout>
  );
}