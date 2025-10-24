import React from 'react';
import { HiPencil, HiTrash } from "react-icons/hi2";

/**
 * Component chứa các nút hành động (Sửa, Xóa)
 * @param {function} onEdit - Hàm xử lý khi nhấn nút sửa
 * @param {function} onDelete - Hàm xử lý khi nhấn nút xóa
 */
function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onEdit}
        className="btn btn-square btn-sm btn-ghost text-blue-500"
        title="Chỉnh sửa"
      >
        <HiPencil className="w-5 h-5" />
      </button>
      <button
        onClick={onDelete}
        className="btn btn-square btn-sm btn-ghost text-red-500"
        title="Xóa"
      >
        <HiTrash className="w-5 h-5" />
      </button>
    </div>
  );
}

export default ActionButtons;