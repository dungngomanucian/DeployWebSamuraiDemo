import React, { useState } from 'react';
import SearchBar from '../components/Admin/SearchBar';
import AddNewButton from '../components/Admin/AddNewButton';

/**
 * Layout chung cho các trang hiển thị danh sách.
 * Nó cung cấp khung sườn bao gồm tiêu đề, nút "Thêm mới", và ô tìm kiếm.
 * Nội dung chính (bảng, lưới thẻ, etc.) sẽ được truyền vào qua prop `children`.
 */
export default function IndexLayout({ title, onAddNew, onSearch, children }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="p-4 bg-base-100 rounded-lg shadow-sm">
      {/* Header: Tiêu đề và nút Thêm mới */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        {onAddNew && <AddNewButton onClick={onAddNew} />}
      </div>

      {/* Thanh tìm kiếm */}
      {onSearch && (
        <SearchBar 
          value={searchTerm}
          onChange={handleSearchChange}
        />
      )}

      {/* Nội dung chính */}
      <div>
        {children}
      </div>
    </div>
  );
}