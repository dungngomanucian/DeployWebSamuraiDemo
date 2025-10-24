import React from 'react';
import { HiChevronUp, HiChevronDown } from "react-icons/hi2";

/**
 * Header cột có thể sắp xếp
 */
function SortableHeader({ column, sortConfig, onSort }) {
  const isSorted = sortConfig.key === column.accessor;
  const direction = sortConfig.direction;

  return (
    <div 
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={() => onSort(column.accessor)}
    >
      <span>{column.header}</span>
      <div className="flex flex-col">
        {isSorted ? (
          direction === 'asc' ? (
            <HiChevronUp className="w-4 h-4 text-primary" />
          ) : (
            <HiChevronDown className="w-4 h-4 text-primary" />
          )
        ) : (
          <>
            <HiChevronUp className="w-4 h-4 -mb-2 text-gray-400" />
            <HiChevronDown className="w-4 h-4 text-gray-400" />
          </>
        )}
      </div>
    </div>
  );
}

export default SortableHeader;