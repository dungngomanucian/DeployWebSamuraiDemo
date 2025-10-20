// SAMURAI_JAPANESE_APP - Reset Password Page
import React, { useState } from 'react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import { studentApiClient } from "../../../api/axiosConfig";
import { useSearchParams } from 'react-router-dom';

// Link giả lập
const Link = ({ to, children, className, 'aria-label': ariaLabel }) => (
  <a href={to} className={className} aria-label={ariaLabel}>
    {children}
  </a>
);

// --- InputField Component ---
const InputField = ({ label, placeholder, icon: Icon, type = 'text', name, value, onChange }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  return (
    <div className="w-full mb-6 group">
      <label className="text-sm font-medium text-gray-600 block mb-1">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full py-3 px-0 border-b-2 focus:outline-none focus:border-indigo-600 bg-transparent text-base pl-10 placeholder:text-gray-400"
          aria-label={label}
          autoComplete={name === 'password' || name === 'confirmPassword' ? 'new-password' : name}
        />
        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400">
          {Icon && <Icon className="h-5 w-5" />}
        </span>
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 p-2 hover:text-indigo-600"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Reset Password Form ---
const ResetPasswordForm = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  // --- Kiểm tra mật khẩu ---
  const validatePassword = (password) => {
    if (password.length < 8) return "Mật khẩu phải có tối thiểu 8 ký tự.";
    if (!/[A-Z]/.test(password)) return "Mật khẩu phải có chữ cái in hoa.";
    if (!/[a-z]/.test(password)) return "Mật khẩu phải có chữ cái in thường.";
    if (!/[0-9]/.test(password)) return "Mật khẩu phải có chữ số.";
    if (!/[!@#$%^&*]/.test(password)) return "Mật khẩu phải có chứa ký tự đặc biệt (!,@,#,$,%,^,&,*...)";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await studentApiClient.post('student/reset-password/', {
        token,
        new_password: password
      });

      toast.success(data.message || "Đặt lại mật khẩu thành công!");
      setFormData({ password: '', confirmPassword: '' });
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Không thể kết nối đến máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      {showSuccessModal && (
        <SuccessModal 
          message="Mật khẩu đã được cập nhật thành công!" 
          onClose={() => setShowSuccessModal(false)} 
        />
      )}

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 relative">
        <Link 
          to="/" 
          className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50"
          aria-label="Đóng form"
        >
          <XMarkIcon className="h-6 w-6" />
        </Link>

        <div className="mb-10 mt-2">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Tạo Mật Khẩu Mới</h1>
          <div className="text-gray-500 mt-2 text-base">
            <h3 className="text-xl text-gray-800 mb-6">*Lưu ý mật khẩu mới:</h3>
            <div className="mt-0.5">
              <p className="text-indigo-600 font-semibold" >• Có tối thiểu 8 ký tự</p> 
              <p className="text-indigo-600 font-semibold" >• Có chứa chữ cái in hoa (A-Z)</p> 
              <p className="text-indigo-600 font-semibold" >• Có chứa chữ cái in thường (a-z)</p> 
              <p className="text-indigo-600 font-semibold" >• Có chứa chữ số (0-9)</p> 
              <p className="text-indigo-600 font-semibold" >• Có chứa ký tự đặc biệt (!, @, #, $, %, ^, &, *...)</p> 
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <InputField
            label="Mật khẩu"
            placeholder="********"
            icon={LockClosedIcon}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <InputField
            label="Nhập lại mật khẩu"
            placeholder="********"
            icon={LockClosedIcon}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {errorMessage && (
            <div className="text-red-500 text-sm font-medium mt-4 p-2 bg-red-50 rounded-lg border border-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl shadow-lg hover:from-indigo-700 hover:to-blue-600 transition duration-300 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-98'}`}
          >
            {isSubmitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Modal Thành Công ---
const SuccessModal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  style={{ backgroundColor: 'rgba(217, 217, 217)' }}>
    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm text-center">
      <div className="text-4xl text-green-500 mb-4">✅</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Hoàn tất!</h3>
      <p className="mb-6 text-gray-600">{message}</p>
      <button 
        className="py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
        style={{ backgroundColor: 'rgba(53, 99, 233)' }}
      >
        <Link to="/login">Về Trang Đăng Nhập</Link>
      </button>
    </div>
  </div>
);

export default ResetPasswordForm;
