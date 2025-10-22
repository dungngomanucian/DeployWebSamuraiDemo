import React from 'react';
import { HiPlus } from "react-icons/hi2";

/**
 * Component nút thêm mới
 * @param {function} onClick - Hàm xử lý khi nút được nhấn
 */
function AddNewButton({ onClick }) {
  return (
    <button onClick={onClick} className="btn btn-primary">
      <HiPlus className="w-6 h-6" />
      Thêm mới
    </button>
  );
}

export default AddNewButton;