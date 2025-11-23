import React from 'react';
import SortableHeader from './SortableHeader';
import ActionButtons from './ActionButtons';

export default function ContentTable({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  currentPage, 
  pageSize,
  sortConfig,
  onSort
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4">Không tìm thấy dữ liệu phù hợp.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full table-zebra">
        {/* thead giữ nguyên */}
        <thead>
          <tr>
            <th className="w-10">#</th>
            {columns.map((col) => (
              <th key={col.accessor}>
                <SortableHeader
                  column={col}
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>
            ))}
            <th className="w-28 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {/* data giờ là dataWithCustomActions */}
          {data.map((row, index) => (
            <tr key={row.id} className="hover">
              <th>{((currentPage - 1) * pageSize) + index + 1}</th>
              {columns.map((col) => (
                <td key={col.accessor}>
                  {col.format ? col.format(row[col.accessor]) : row[col.accessor]}
                </td>
              ))}
              <td className="w-28">
                <div className="flex justify-center">
                   <ActionButtons
                     recordId={row.id}       // Truyền ID bản ghi
                     onEdit={onEdit}         // Truyền handler Edit
                     onDelete={onDelete}     // Truyền handler Delete
                     customActions={row.customActions || []} // Lấy customActions từ row
                   />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}