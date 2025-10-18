// frontend/src/pages/admin/ManageStudents.jsx
import React, { useState, useEffect } from 'react';
import IndexLayout from '../../../layouts/IndexLayout'; // Import layout mới
import { HiPencil, HiTrash } from "react-icons/hi2";

// Dữ liệu giả lập
const fakeStudentData = [
  { id: 1, fullName: 'Nguyễn Văn An', email: 'an.nv@email.com', joinDate: '2025-10-15' },
  { id: 2, fullName: 'Trần Thị Bích', email: 'bich.tt@email.com', joinDate: '2025-10-14' },
  { id: 3, fullName: 'Lê Văn Cường', email: 'cuong.lv@email.com', joinDate: '2025-10-13' },
];

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    setStudents(fakeStudentData);
    setFilteredStudents(fakeStudentData);
  }, []);

  const columns = [
    { header: 'Họ và tên', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Ngày tham gia', accessor: 'joinDate' },
  ];

  const handleAddNew = () => console.log("Thêm học viên mới...");
  const handleEdit = (id) => console.log(`Sửa học viên ID: ${id}`);
  const handleDelete = (id) => console.log(`Xóa học viên ID: ${id}`);
  const handleSearch = (searchTerm) => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = students.filter(student => 
      student.fullName.toLowerCase().includes(lowercasedTerm) ||
      student.email.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredStudents(filtered);
  };

  return (
    <IndexLayout
      title="Quản lý học viên"
      onAddNew={handleAddNew}
      onSearch={handleSearch}
    >
      {/* Toàn bộ phần JSX dưới đây chính là "children" được truyền vào layout */}
      <div className="overflow-x-auto">
        <table className="table w-full">
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
            {filteredStudents.map((row, index) => (
              <tr key={row.id} className="hover">
                <th>{index + 1}</th>
                {columns.map((col) => (
                  <td key={col.accessor}>{row[col.accessor]}</td>
                ))}
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(row.id)} className="btn btn-sm btn-outline btn-info">
                      <HiPencil />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="btn btn-sm btn-outline btn-error">
                      <HiTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IndexLayout>
  );
}