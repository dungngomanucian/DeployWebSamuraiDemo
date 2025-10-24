// frontend/src/components/common/PaginationControls.jsx
import React from 'react';

export default function PaginationControls({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null; // Không hiển thị nếu chỉ có 1 trang
  }

  return (
    <div className="flex justify-center mt-6">
      <div className="join">
        <button
          className="join-item btn btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          «
        </button>
        <button className="join-item btn btn-sm">
          Trang {currentPage} / {totalPages}
        </button>
        <button
          className="join-item btn btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          »
        </button>
      </div>
    </div>
  );
}