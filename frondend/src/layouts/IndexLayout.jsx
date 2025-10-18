// frontend/src/pages/admin/IndexLayout.jsx
import React, { useState } from 'react';
import { HiPlus } from "react-icons/hi2";

/**
 * Layout chung cho các trang hiển thị danh sách.
 * Nó cung cấp khung sườn bao gồm tiêu đề, nút "Thêm mới", và ô tìm kiếm.
 * Nội dung chính (bảng, lưới thẻ, etc.) sẽ được truyền vào qua prop `children`.
 */
export default function IndexLayout({ title, onAddNew, onSearch, children }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="p-4 bg-base-100 rounded-lg shadow-sm">
      {/* Header: Tiêu đề và nút Thêm mới */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        {onAddNew && (
          <button onClick={onAddNew} className="btn btn-primary">
            <HiPlus className="w-6 h-6" />
            Thêm mới
          </button>
        )}
      </div>

      {/* Thanh tìm kiếm */}
      {onSearch && (
        <div className="mb-4">
          <label className="input input-bordered flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
            <input 
              type="text" 
              className="grow" 
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </label>
        </div>
      )}
      
      {/* Vùng nội dung chính được truyền từ component cha */}
      <div>
        {children}
      </div>
    </div>
  );
}