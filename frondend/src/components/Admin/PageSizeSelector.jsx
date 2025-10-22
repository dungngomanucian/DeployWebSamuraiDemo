import React from 'react';

/**
 * Component để chọn số lượng bản ghi hiển thị trên mỗi trang
 */
function PageSizeSelector({ pageSize, onPageSizeChange, isDisabled = false }) {
  return (
    <div>
      <label htmlFor="pageSize" className="mr-2 text-sm">Hiển thị:</label>
      <select 
        id="pageSize" 
        value={pageSize} 
        onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        className="select select-bordered select-sm"
        disabled={isDisabled}
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={30}>30</option>
      </select>
      <span className="ml-2 text-sm">bản ghi/trang</span>
    </div>
  );
}

export default PageSizeSelector;