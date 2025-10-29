import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
// >>> API THẬT: ĐÃ BỎ COMMENT, SỬ DỤNG HÀM userlogin TỪ ĐÂY
import { userlogin } from "../../../api/authService"; 

// Import icons
import { Mail, Lock, X, Eye, EyeOff, CheckSquare, CheckCircle, Loader2, AlertTriangle, Info } from 'lucide-react'; 
import logo from '../../../assets/logo.png' 

// >>> ĐỊNH NGHĨA SERVICE DÙNG API THẬT
const loginService = userlogin;

// >>> ĐỊNH NGHĨA REGEX CHO EMAIL
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


// --- [Toast Component] ---
const Toast = ({ id, message, type, onClose }) => {
    const iconMap = {
        success: { icon: CheckCircle, class: 'bg-green-500', title: 'Thành công' },
        error: { icon: AlertTriangle, class: 'bg-red-500', title: 'Thất bại' },
        warning: { icon: Info, class: 'bg-yellow-500', title: 'Cảnh báo' },
    };
    const { icon: Icon, class: bgColorClass, title } = iconMap[type] || iconMap.info;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000); // Tự động đóng sau 5 giây

        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div 
            className={`
                flex items-start p-4 mb-3 w-full max-w-sm 
                rounded-lg shadow-xl text-white 
                transform transition-all duration-300 ease-out
                ${bgColorClass}
                animate-toast-in
            `}
            role="alert"
        >
            <Icon size={24} className="flex-shrink-0 mt-0.5" />
            <div className="ml-3 text-sm font-medium flex-grow">
                <p className="font-bold">{title}</p>
                <p>{message}</p>
            </div>
            <button 
                onClick={() => onClose(id)} 
                className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg text-white hover:bg-opacity-80 transition"
                aria-label="Đóng thông báo"
            >
                <X size={20} />
            </button>
        </div>
    );
};

// --- [ToastContainer Component] ---
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <>
            <style>{`
                /* Custom Keyframes cho Toast Animation */
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-toast-in {
                    animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
            <div className="fixed top-5 right-5 z-50 pointer-events-none space-y-3">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast 
                            id={toast.id} 
                            message={toast.message} 
                            type={toast.type} 
                            onClose={removeToast} 
                        />
                    </div>
                ))}
            </div>
        </>
    );
};


// --- [InputField Component: ĐÃ CHỈNH SỬA ĐỂ HIỂN THỊ LỖI STRING] ---
// isInvalid có thể là boolean (cho lỗi mặc định) hoặc string (cho lỗi cụ thể)
const InputField = ({ label, placeholder, icon : Icon , type = 'text', name, value, onChange, isRequired, isInvalid }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputType = (type === 'password' && isPasswordVisible) ? 'text' : type;
    const _unused = Icon;


    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
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

    // Kiểm tra xem có lỗi không (isInvalid có thể là true hoặc một chuỗi lỗi)
    const hasError = isInvalid && (typeof isInvalid === 'boolean' || typeof isInvalid === 'string');

    const inputClasses = `
        w-full py-3 pr-4 pl-10 
        border-t-0 border-l-0 border-r-0 border-b-2 
        ${hasError ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-indigo-600'}
        rounded-none 
        focus:outline-none 
        text-lg transition duration-300 ease-in-out
        placeholder:text-gray-400 bg-transparent
    `;
    const iconClass = `absolute left-0 top-1/2 transform -translate-y-1/2 transition duration-300 ${hasError ? 'text-red-500' : 'text-gray-400 group-focus-within:text-indigo-600'}`;

    return (
        <div className="w-full mb-8 group">
            <label className="text-base font-medium text-gray-700 block mb-2">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    className={inputClasses}
                    style={{ boxShadow: 'none' }}
                    aria-label={label}
                    aria-required={isRequired}
                    

                    
                />
                
                <span className={iconClass}>
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
            {/* HIỂN THỊ LỖI BẰNG THẺ SPAN */}
            {hasError && (
                <span className="text-red-500 text-sm mt-1 block">
                    {/* Nếu lỗi là chuỗi, hiển thị chuỗi lỗi; nếu là true, hiển thị lỗi mặc định */}
                    {typeof isInvalid === 'string' ? isInvalid : 'Trường này không được để trống.'}
                </span>
            )}
        </div>
    );
};


// Component chính StudentLogin
const StudentLogin = () => {
    const navigate = useNavigate(); 
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false, 
    });
    
    // errors lưu trữ thông báo lỗi (string) hoặc boolean (true/false)
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    // --- 1. KIỂM TRA JWT VÀ CHUYỂN HƯỚNG KHI LOAD TRANG ---
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            // Nếu có token, chuyển hướng về trang chủ
            navigate('/');
        }
    }, [navigate]);
    // ------------------------------------------------------


    // --- Toast Management ---
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);
    // -------------------------

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        // Xóa lỗi khi người dùng bắt đầu nhập
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // 2. KIỂM TRA ĐỊNH DẠNG EMAIL
        if (!formData.email.trim()) {
            // Lỗi rỗng
            newErrors.email = 'Email không được để trống.';
            isValid = false;
        } else if (!EMAIL_REGEX.test(formData.email.trim())) { 
            // Lỗi định dạng Email
            newErrors.email = 'Định dạng Email không hợp lệ. Vui lòng kiểm tra lại.'; 
            isValid = false;
        }
        
        // Kiểm tra mật khẩu rỗng (sử dụng boolean true)
        if (!formData.password.trim()) {
            newErrors.password = true;
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        // 1. Kiểm tra validation
        if (!validateForm()) {
            addToast("Vui lòng kiểm tra lại Email và Mật khẩu.", "warning");
            return;
        }

        setIsLoading(true);
        
        try {
            // 2. GỌI HÀM SERVICE API THẬT
            const { data, error } = await loginService(
                formData.email, 
                formData.password, 
                formData.rememberMe
            );

            if (error) {
                // Đăng nhập thất bại
                const errorMessage = error.includes("HTTP") || error.includes("Timeout") 
                    ? "Lỗi kết nối máy chủ. Vui lòng kiểm tra địa chỉ API hoặc kết nối mạng." 
                    : error; // Hiển thị lỗi chi tiết

                addToast(errorMessage, "error");
                
            } else {
                // Đăng nhập thành công
                const token = data.token; 
                
                // >>> LƯU TRỮ JWT
                if (token) {
                    localStorage.setItem('auth_token', token); 
                }

                addToast(`Chào mừng trở lại! Đăng nhập thành công.`, "success");
                
                // Chuyển hướng sau khi hiển thị toast thành công (ví dụ sau 1 giây)
                setTimeout(() => {
                    navigate('/student-dashboard'); 
                }, 1000);
            }
            
        } catch (runtimeError) {
            console.error("Lỗi ngoài luồng (Network/Parsing):", runtimeError);
            addToast("Lỗi không xác định khi đăng nhập. Vui lòng thử lại.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
                
                <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-3xl border border-gray-200 transition duration-500 relative transform hover:shadow-4xl">
                    
                    <Link 
                        to="/" 
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition duration-200 p-2 rounded-full hover:bg-red-50"
                        aria-label="Đóng form đăng nhập"
                    >
                        <X size={24} />
                    </Link>

                    <div className="mb-10"> 
                        <img 
                            src={logo} 
                            alt="Samurai Japanese App Logo" 
                            className="w-48 h-20 mb-6 object-contain object-left mx-auto md:mx-0" 
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
                    <form onSubmit={handleLogin} className="space-y-4" noValidate> 
                        {/* Input 1: Email */}
                        <InputField
                            label="Nhập Email của bạn" 
                            placeholder="samurai@gmail.com"
                            icon={Mail} 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isRequired={true}
                            // errors.email là string (lỗi định dạng/rỗng) hoặc undefined
                            isInvalid={errors.email}
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
                            isRequired={true}
                            // errors.password là boolean true/false
                            isInvalid={errors.password}
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
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </button>
                        </div>
                    </form>
                    
                </div>
                
            </div>
        </>
    );
};


export default StudentLogin;