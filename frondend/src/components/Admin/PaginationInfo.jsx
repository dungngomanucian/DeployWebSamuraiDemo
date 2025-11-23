import React from 'react';

/**
 * Component hiển thị thông tin về số bản ghi đang hiển thị
 */
function PaginationInfo({ currentPage, pageSize, totalCount, currentCount }) {
  const startRecord = currentCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <span className="text-sm">
      Hiển thị {startRecord}-{endRecord} trên tổng số {totalCount} bản ghi
    </span>
  );
}

export default PaginationInfo;