// frontend/src/components/admin/StudentTable.jsx
import React from 'react';
import { HiPencil, HiTrash } from "react-icons/hi2";

export default function StudentTable({ columns, data, onEdit, onDelete, currentPage, pageSize }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4">Không tìm thấy dữ liệu phù hợp.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full table-zebra">
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
          {data.map((row, index) => (
            <tr key={row.id} className="hover">
              <th>{((currentPage - 1) * pageSize) + index + 1}</th>
              {columns.map((col) => (
                <td key={col.accessor}>
                  {col.format ? col.format(row[col.accessor]) : row[col.accessor]}
                </td>
              ))}
              <td>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(row.id)} className="btn btn-sm btn-outline btn-info">
                    <HiPencil />
                  </button>
                  <button onClick={() => onDelete(row.id)} className="btn btn-sm btn-outline btn-error">
                    <HiTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}