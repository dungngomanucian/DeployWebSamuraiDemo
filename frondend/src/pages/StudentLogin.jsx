import React, { useState } from 'react';
// Import logo từ file cục bộ theo yêu cầu của bạn
import logo from '../assets/logo.png'; 
// Import icons
import { Mail, Lock, X, Eye, EyeOff, CheckSquare, CheckCircle } from 'lucide-react'; 

// Giả lập component Link cho môi trường Canvas/VS Code đơn giản.
const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;

/**
 * Component InputField tùy chỉnh
 */
const InputField = ({ label, placeholder, icon : Icon , type = 'text', name, value, onChange }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = (type === 'password' && isPasswordVisible) ? 'text' : type;

  const handleInputChange = (e) => {
    let newValue = e.target.value;
    let targetName = e.target.name;

    if (type === 'tel') {
      newValue = newValue.replace(/\D/g, '');
    }

    const filteredEvent = {
      ...e,
      target: {
        ...e.target,
        name: targetName,
        value: newValue
      }
    };
    
    onChange(filteredEvent);
  };

  return (
    <div className="w-full mb-8 group">
      <label className="text-base font-medium text-gray-700 block mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          className={`
            w-full py-3 px-0 border-t-0 border-l-0 border-r-0 border-b-2
            focus:outline-none focus:border-indigo-600 rounded-none bg-transparent
            text-lg pl-10 transition duration-200
          `}
          style={{ boxShadow: 'none', borderColor: '#d1d5db' }}
          aria-label={label}
        />
        
        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition duration-200">
          <Icon size={20} />
        </span>

        {type === 'password' && (
          <button
            type="button"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 p-2 hover:text-indigo-600 transition duration-150"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Success Modal Component
 */
const SuccessModal = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full transform scale-100 transition-transform duration-300">
                <div className="flex flex-col items-center">
                    <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce-in" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Thành công!</h3>
                    <p className="text-gray-600 text-center mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-lg font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-200 shadow-md"
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    );
}

// Component chính StudentLogin
const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false, 
  });
  
  // Thêm state để quản lý trạng thái hiển thị modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Dữ liệu Đăng nhập:", formData);
    
    // Hiển thị Modal
    setShowSuccessModal(true);

    // Tùy chọn: Tự động đóng modal sau 3 giây
    // setTimeout(() => {
    //     setShowSuccessModal(false);
    // }, 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Container chính */}
      <div className="w-full max-w-lg bg-white p-8 md:p-12 rounded-xl shadow-2xl border border-gray-100 transition duration-500 hover:shadow-3xl relative">
        
        {/* Nút Đóng (X) */}
        <Link 
          to="/" 
          className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
          aria-label="Đóng form đăng nhập"
        >
          <X size={24} />
        </Link>

        {/* Header - Logo và Tiêu đề */}
        <div className="mb-12"> 
          <img 
            src={logo} 
            alt="Samurai Japanese App Logo" 
            className="w-48 h-20 mb-6 object-contain object-left" 
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/192x80/9333ea/ffffff?text=LOGO" }}
          />
          
          {/* Tiêu đề chính */}
          <h1 className="text-4xl font-extrabold text-indigo-700 mb-4 text-left">
            Đăng nhập
          </h1>
          
          {/* Text "Chưa có tài khoản" */}
          <p className="text-gray-500 text-lg mt-8 text-left">
            Nếu bạn chưa có tài khoản
          </p>
          
          <p className="text-gray-500 text-lg mt-0 text-left">
            <Link 
              to="/signup" 
              className="text-indigo-600 font-semibold hover:underline transition duration-150"
            >
              Bạn có thể Đăng ký tại đây!
            </Link>
          </p>
        </div>


        {/* Form nhập liệu */}
        <form onSubmit={handleLogin} className="space-y-6"> 
          <InputField
            label="Nhập Email của bạn"
            placeholder="samurai@gmail.com"
            icon={Mail} 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            label="Mật khẩu"
            placeholder="***********"
            icon={Lock} 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          
          {/* Ghi nhớ đăng nhập và Quên mật khẩu */}
          <div className="flex justify-between items-center text-sm pt-4">
            <label className="flex items-center cursor-pointer text-gray-700">
              <input 
                type="checkbox" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="hidden" 
              />
              <div className={`w-5 h-5 border-2 rounded mr-2 transition duration-150 flex items-center justify-center 
                ${formData.rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}
              `}>
                {formData.rememberMe && <CheckSquare size={16} className="text-white" />}
              </div>
              <span className="text-base text-gray-700">Ghi nhớ đăng nhập</span>
            </label>

            <Link 
              to="/forgot-password" 
              className="text-indigo-600 text-base font-medium hover:underline transition duration-150"
            >
              Quên mật khẩu?
            </Link>
          </div>

          
          {/* Nút Đăng nhập */}
          <div className="pt-8"> 
            <button
              type="submit"
              className="w-full py-4 text-xl font-bold text-white 
                bg-gradient-to-r from-indigo-500 to-blue-600 
                rounded-lg shadow-lg 
                hover:from-indigo-600 hover:to-blue-700 
                transition duration-300 transform hover:scale-[1.01] hover:shadow-xl"
            >
              Đăng nhập
            </button>
          </div>
        </form>
        
      </div>
      
      {/* Hiển thị Modal thông báo thành công */}
      {showSuccessModal && (
          <SuccessModal 
              message="Bạn đã đăng nhập vào hệ thống Samurai Japanese App thành công!"
              onClose={() => setShowSuccessModal(false)}
          />
      )}
    </div>
  );
};

export default StudentLogin;
