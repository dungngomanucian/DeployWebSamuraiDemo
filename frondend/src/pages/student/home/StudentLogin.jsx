import React, { useState } from 'react';
// FIX: DÒNG NÀY ĐÃ ĐƯỢC THAY THẾ bằng placeholder URL để biên dịch trong môi trường ảo.
import logo from '../../../assets/logo.png'

// Import icons
import { Mail, Lock, X, Eye, EyeOff, CheckSquare, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'; 

// Giả lập component Link cho môi trường Canvas/VS Code đơn giản.
const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;

// Cấu hình API Backend - QUAN TRỌNG: Phải khớp với địa chỉ chạy Django
const API_BASE_URL = 'http://127.0.0.1:8000/api/login/'; 

/**
 * Component InputField tùy chỉnh với thiết kế bottom border (viền dưới)
 */
const InputField = ({ label, placeholder, icon : Icon , type = 'text', name, value, onChange }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = (type === 'password' && isPasswordVisible) ? 'text' : type;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    
    if (type === 'tel') {
      newValue = value.replace(/\D/g, '');
    }

    const filteredEvent = {
      ...e,
      target: {
        ...e.target,
        name: name,
        value: newValue
      }
    };
    
    onChange(filteredEvent);
  };

  return (
    <div className="w-full mb-8 group">
      <label className="text-base font-medium text-gray-700 block mb-2">
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
            w-full py-3 pr-4 pl-10 
            border-t-0 border-l-0 border-r-0 border-b-2 border-gray-300 rounded-none 
            focus:outline-none focus:border-indigo-600 
            text-lg transition duration-300 ease-in-out
            placeholder:text-gray-400 bg-transparent
          `}
          style={{ boxShadow: 'none' }}
          aria-label={label}
        />
        
        <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition duration-300">
          <Icon size={20} />
        </span>

        {type === 'password' && (
          <button
            type="button"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 p-1 hover:text-indigo-600 transition duration-150"
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
 * Modal Component chung cho Success và Error
 */
const CustomModal = ({ message, onClose, isSuccess = true }) => {
    const Icon = isSuccess ? CheckCircle : AlertTriangle;
    const colorClass = isSuccess ? 'text-green-500 bg-green-500 hover:bg-green-600' : 'text-red-500 bg-red-500 hover:bg-red-600';
    const title = isSuccess ? 'Thành công!' : 'Thất bại!';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full transform scale-95 transition-all duration-300 animate-scale-up">
                <div className="flex flex-col items-center">
                    <Icon size={64} className={`${colorClass.split(' ')[0]} mb-4 animate-bounce-in`} />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600 text-center mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className={`w-full py-3 text-lg font-semibold text-white rounded-lg transition duration-200 shadow-md transform hover:scale-[1.02] ${colorClass.split(' ').slice(1).join(' ')}`}
                    >
                        Đã hiểu
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
  
  const [modalState, setModalState] = useState({
      show: false,
      message: '',
      isSuccess: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setModalState({ show: false, message: '', isSuccess: true });
    
    try {
        // GỌI API ĐẾN BACKEND DJANGO
        const response = await fetch(`${API_BASE_URL}auth-login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Đăng nhập thành công
            const token = data.token;
            // LƯU TOKEN: Lưu JWT vào LocalStorage để sử dụng cho các request tiếp theo
            localStorage.setItem('auth_token', token); 
            console.log("Token nhận được:", token);
            
            setModalState({
                show: true,
                message: "Bạn đã đăng nhập thành công! Token đã được lưu trữ cục bộ. Nếu bạn vượt quá 2 thiết bị đăng nhập, phiên cũ nhất sẽ bị hủy.",
                isSuccess: true,
            });
            
        } else {
            // Đăng nhập thất bại (401, 400, 500...)
            const errorMessage = data.error || data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.";
            setModalState({
                show: true,
                message: errorMessage,
                isSuccess: false,
            });
        }
        
    } catch (error) {
        console.error("Lỗi mạng hoặc server:", error);
        setModalState({
            show: true,
            message: "Không thể kết nối đến máy chủ Backend (Django). Vui lòng kiểm tra địa chỉ API và kết nối mạng.",
            isSuccess: false,
        });
    } finally {
        setIsLoading(false);
    }
  };
    
  const closeModal = () => setModalState({ show: false, message: '', isSuccess: true });


  return (
    <>
      {/* Thêm custom CSS animation cho Modal */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
          .animate-scale-up {
            animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          .shadow-3xl {
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          .hover\\:shadow-4xl:hover {
            box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.25);
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-3xl border border-gray-200 transition duration-500 relative transform hover:shadow-4xl">
          
          <Link 
            to="/" 
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition duration-200 p-2 rounded-full hover:bg-red-50"
            aria-label="Đóng form đăng nhập"
          >
            <X size={24} />
          </Link>

          <div className="mb-10"> 
            
            {/* SỬ DỤNG LOGO TẠM THỜI TRONG MÔI TRƯỜNG ẢO */}
            <img 
              src={logo} 
              alt="Samurai Japanese App Logo" 
              className="w-48 h-20 mb-6 object-contain object-left mx-auto md:mx-0" 
              // Thêm fallback an toàn (dành cho môi trường thực)
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/192x80/2932e1/ffffff?text=LOGO" }}
            />
            
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-2 text-left tracking-tight">
              Đăng nhập
            </h1>
            
            <div className="mt-8 text-left">
                <p className="text-gray-500 text-lg">
                    Nếu bạn chưa có tài khoản
                </p>
                <p className="text-gray-500 text-lg">
                    <Link 
                        to="/register" 
                        className="text-indigo-600 font-semibold hover:underline transition duration-150"
                    >
                        Bạn có thể Đăng ký tại đây!
                    </Link>
                </p>
            </div>
          </div>


          {/* Form nhập liệu */}
          <form onSubmit={handleLogin} className="space-y-4"> 
            {/* Input 1: Email */}
            <InputField
              label="Nhập Email của bạn" 
              placeholder="samurai@gmail.com"
              icon={Mail} 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {/* Input 2: Mật khẩu */}
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
              <label className="flex items-center cursor-pointer text-gray-700 select-none">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="hidden" 
                />
                <div className={`w-5 h-5 border-2 rounded-md mr-2 transition duration-200 flex items-center justify-center 
                  ${formData.rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-400 hover:border-indigo-400'}
                `}>
                  {formData.rememberMe && <CheckSquare size={16} className="text-white" />}
                </div>
                <span className="text-base text-gray-600">Ghi nhớ đăng nhập</span>
              </label>

              <Link 
                to="/forgot-password" 
                className="text-indigo-600 text-base font-medium transition duration-150 hover:text-indigo-800 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            
            {/* Nút Đăng nhập - Áp dụng hiệu ứng Hover và Loading State */}
            <div className="pt-8"> 
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-4 text-xl font-bold text-white 
                  rounded-xl shadow-lg 
                  transition-all duration-300 transform 
                  flex items-center justify-center
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] active:shadow-md'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={24} className="animate-spin mr-3" />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>
          
        </div>
        
        {/* Hiển thị Modal thông báo */}
        {modalState.show && (
            <CustomModal 
                message={modalState.message}
                isSuccess={modalState.isSuccess}
                onClose={closeModal}
            />
        )}
      </div>
    </>
  );
};

export default StudentLogin;
