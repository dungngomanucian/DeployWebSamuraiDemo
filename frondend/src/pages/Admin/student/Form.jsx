// frontend/src/pages/admin/student/CreateStudentPage.jsx
import React, { useState, useEffect, useRef } from 'react'; // Thêm useRef
import { useNavigate } from 'react-router-dom';
import { getAllClassroomActive } from '../../../api/admin/manageStudentService'; // Giả sử bạn có hàm createStudent ở đây

// Import các component PrimeReact
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast'; // Để hiển thị thông báo
import { ProgressSpinner } from 'primereact/progressspinner'; // Hiển thị loading đẹp hơn
import { format } from 'date-fns'; // Vẫn dùng date-fns để gửi đi đúng định dạng

export default function CreateStudentPage() {
  const navigate = useNavigate();
  const toast = useRef(null); // Ref cho Toast component
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: null, // Calendar dùng Date object
    gender: null, // Dropdown có thể dùng null
    address: '',
    parent_phone_number: '',
    classroom_code: null, // Dropdown có thể dùng null
    target_exam: null,
    target_jlpt_degree: null,
    target_date: null, // Calendar dùng Date object
    hour_per_day: null,
    total_exam_hour: null,
    streak_day: null,
    score_latest: null,
    total_test: null,
    total_exam: null,
    account_id: '',
  });
  const [loading, setLoading] = useState(false);
  // Bỏ state error, dùng toast để thay thế
  // const [error, setError] = useState(null); 
  const [classrooms, setClassrooms] = useState([]);
  const [classroomLoading, setClassroomLoading] = useState(true);

  // === Dữ liệu tĩnh cho Dropdowns ===
  const genderOptions = [
    { label: 'Nam', value: '1' },
    { label: 'Nữ', value: '2' },
  ];
  const examOptions = [
    { label: 'JLPT', value: 'JLPT' },
    { label: 'EJU', value: 'EJU' },
  ];
  const jlptLevelOptions = [
    { label: 'N1', value: 'N1' },
    { label: 'N2', value: 'N2' },
    { label: 'N3', value: 'N3' },
    { label: 'N4', value: 'N4' },
    { label: 'N5', value: 'N5' },
  ];

  // === Fetch dữ liệu lớp học ===
  useEffect(() => {
    const fetchClassrooms = async () => {
      setClassroomLoading(true);
      const { data: classroomData, error: classroomApiError } = await getAllClassroomActive();

      if (classroomApiError) {
        toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: `Không thể tải danh sách lớp học: ${classroomApiError}`, life: 3000 });
      } else if (classroomData && Array.isArray(classroomData)) {
        // Map dữ liệu cho Dropdown
        const formattedClassrooms = classroomData.map(cls => ({
          label: cls.class_name, // Text hiển thị
          value: cls.class_code, // Giá trị lưu lại
          id: cls.id // Giữ lại id nếu cần
        }));
        setClassrooms(formattedClassrooms);
      } else {
        setClassrooms([]);
      }
      setClassroomLoading(false);
    };

    fetchClassrooms();
  }, []);

  // === Handle change cho các component PrimeReact ===
  const handleChange = (e, name) => {
    // Dropdown, Calendar, InputNumber thường trả về e.value
    // InputText trả về e.target.value
    const value = e.value !== undefined ? e.value : e.target.value;
    const fieldName = name || e.target.name; // Lấy name nếu được truyền hoặc từ event target

    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
  };

  // === Handle Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setError(null); // Bỏ error state

    // Chuẩn bị dữ liệu gửi đi
    const dataToSend = {
      ...formData,
      // Format lại Date object thành string 'YYYY-MM-DD' nếu API yêu cầu
      date_of_birth: formData.date_of_birth ? format(formData.date_of_birth, 'yyyy-MM-dd') : null,
      target_date: formData.target_date ? format(formData.target_date, 'yyyy-MM-dd') : null,
      // Đảm bảo gender là số nguyên
      gender: formData.gender ? parseInt(formData.gender, 10) : null,
      // Các trường số khác đã được InputNumber xử lý
    };

    console.log("Dữ liệu gửi đi:", dataToSend);
    // --- Gọi API tạo student ---
    // const { data: responseData, error: apiError } = await createStudent(dataToSend); // Bỏ comment khi có API thật
    // Giả lập
    const apiError = null; 
    const responseData = { id: 'new_student_id_123', ...dataToSend };
    // --- ---

    if (apiError) {
      // setError(`Lỗi khi tạo học viên: ${apiError}`); // Bỏ error state
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: `Lỗi khi tạo học viên: ${apiError}`, life: 3000 });
    } else {
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Tạo học viên thành công!', life: 3000 });
      // Chờ một chút để user thấy toast rồi mới chuyển trang
      setTimeout(() => navigate('/admin/students'), 1500); 
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/admin/students');
  };

  return (
    <div className="p-6 bg-base-100 rounded-lg shadow-sm">
      {/* Toast để hiển thị thông báo */}
      <Toast ref={toast} />

      <h1 className="text-3xl font-bold mb-6">Tạo học viên mới</h1>

      {/* Thay vì báo lỗi chung, để từng field báo lỗi validation nếu cần */}
      
      <form onSubmit={handleSubmit} className="p-fluid space-y-4"> {/* p-fluid giúp component full width */}

        {/* Nhóm thông tin cá nhân */}
        <h2 className="text-xl font-semibold border-b pb-2">Thông tin cá nhân</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="field">
            <label htmlFor="first_name" className="label"><span className="label-text">Họ *</span></label>
            <InputText id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="last_name" className="label"><span className="label-text">Tên *</span></label>
            <InputText id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="date_of_birth" className="label"><span className="label-text">Ngày sinh *</span></label>
            <Calendar id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required dateFormat="dd/mm/yy" showIcon />
          </div>
          <div className="field">
            <label htmlFor="gender" className="label"><span className="label-text">Giới tính *</span></label>
            <Dropdown id="gender" name="gender" value={formData.gender} options={genderOptions} onChange={handleChange} placeholder="Chọn giới tính" required />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="address" className="label"><span className="label-text">Địa chỉ</span></label>
            <InputText id="address" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="parent_phone_number" className="label"><span className="label-text">SĐT Phụ huynh</span></label>
            <InputText id="parent_phone_number" name="parent_phone_number" keyfilter="num" value={formData.parent_phone_number} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="classroom_code" className="label"><span className="label-text">Lớp học *</span></label>
            <Dropdown 
              id="classroom_code" 
              name="classroom_code" 
              value={formData.classroom_code} 
              options={classrooms} // Dùng mảng đã map
              onChange={handleChange} 
              placeholder={classroomLoading ? 'Đang tải...' : 'Chọn lớp học'} 
              required 
              disabled={classroomLoading}
              optionLabel="label" // Hiển thị trường 'label' (class_name)
              optionValue="value" // Lưu trữ trường 'value' (class_code)
              filter // Cho phép tìm kiếm trong dropdown
            />
          </div>
          <div className="field">
            <label htmlFor="account_id" className="label"><span className="label-text">Account ID *</span></label>
            <InputText id="account_id" name="account_id" value={formData.account_id} onChange={handleChange} required />
          </div>
        </div>

        {/* Nút bấm */}
        <div className="flex justify-end gap-4 pt-6">
          <Button label="Quay lại danh sách" type="button" onClick={handleBack} className="p-button-text" disabled={loading} />
          <Button label={loading ? 'Đang lưu...' : 'Xác nhận'} type="submit" loading={loading} />
        </div>
      </form>
    </div>
  );
}