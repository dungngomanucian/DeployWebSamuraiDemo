// SAMURAI_JAPANESE_APP - Frontend Registration Form
// Đã cập nhật để tích hợp quy trình Xác thực Email qua API Backend

import React, { useState, useCallback } from 'react';
// Cần cài đặt và import từ thư viện icon của bạn:
import { 
    UserIcon, 
    EnvelopeIcon, 
    PhoneIcon, 
    LockClosedIcon, 
    EyeIcon, 
    EyeSlashIcon, 
    XMarkIcon,
    ArrowPathIcon, // Dùng cho nút gửi lại mã
} from '@heroicons/react/24/outline'; 

// URL của Backend API
const API_BASE_URL = 'http://localhost:3001/api';

// Định nghĩa giả lập cho Link
const Link = ({ to, children, className, 'aria-label': ariaLabel }) => (
    <a href={to} className={className} aria-label={ariaLabel}>
        {children}
    </a>
);

// --- Component Modal Thông báo Thành công ---
const SuccessModal = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm text-center transform transition duration-300 scale-100 animate-fade-in">
                <div className="text-4xl text-green-500 mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Hoàn tất!</h3>
                <p className="mb-6 text-gray-600">{message}</p>
                <button 
                    onClick={onClose} 
                    className="py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md hover:shadow-lg"
                >
                    Tuyệt vời!
                </button>
            </div>
        </div>
    );
};

// --- Component Modal Xác thực Mã Code (ĐÃ CHUYỂN SANG 4 NÚT BẤM) ---
const VerificationModal = ({ email, codes, onVerify, onResend, onCancel, isVerifying, isResending, externalError, clearExternalError }) => {
    // Không còn state cho inputCode và localError
    
    // Sử dụng externalError cho các lỗi từ API (mã sai, hết hạn)
    const displayError = externalError;

    // Hàm xử lý khi người dùng nhấp vào một mã
    const handleCodeClick = (code) => {
        clearExternalError(); // Xóa lỗi cũ khi người dùng thử lại
        if (!isVerifying) {
            onVerify(code);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-3xl max-w-lg w-full relative">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition duration-150 p-2 rounded-full">
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">Xác thực Email</h2>
                <p className="text-gray-600 mb-6 text-center">
                    Chúng tôi đã gửi 4 mã code đến email: 
                    <span className="font-semibold text-indigo-600 block mt-1 break-words">{email}</span>.
                    Vui lòng kiểm tra hộp thư, chọn **MÃ ĐÚNG** (đã gửi qua email) để xác thực.
                </p>

                {/* HIỂN THỊ LỖI API (nếu có) */}
                {displayError && (
                    <p className="text-red-500 text-sm text-center font-medium mb-4 p-2 bg-red-50 rounded-lg border border-red-200">
                        {displayError}
                    </p>
                )}

                {/* HIỂN THỊ 4 NÚT BẤM MÃ CODE */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {codes.map((code, index) => (
                        <button 
                            key={index} 
                            onClick={() => handleCodeClick(code)}
                            disabled={isVerifying || isResending}
                            className={`
                                w-full py-4 text-xl font-bold rounded-xl shadow-md transition duration-200 
                                ${isVerifying || isResending
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-lg transform hover:scale-[1.02]'}
                                font-mono tracking-widest
                            `}
                        >
                            {code}
                        </button>
                    ))}
                </div>

                {/* HIỂN THỊ TRẠNG THÁI XÁC THỰC */}
                {(isVerifying) && (
                    <div className="flex items-center justify-center py-2 text-indigo-600 font-semibold mb-4">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xác thực mã code...
                    </div>
                )}


                <div className="pt-2">
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={isResending || isVerifying}
                        className="w-full text-sm py-2 text-indigo-600 flex items-center justify-center space-x-2 hover:underline transition duration-150 disabled:text-gray-400"
                    >
                        {isResending ? (
                             <div className="flex items-center justify-center">
                                <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Đang gửi lại...</span>
                             </div>
                        ) : (
                            <>
                                <ArrowPathIcon className="h-4 w-4" />
                                <span>Gửi lại Mã Xác Thực</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Component InputField tùy chỉnh ---
// (Giữ nguyên component InputField của bạn)
const InputField = ({ label, placeholder, icon: Icon, type = 'text', name, value, onChange }) => {
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
        <div className="w-full mb-6 group">
            <label className="text-sm font-medium text-gray-600 block mb-1">
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
                        text-base pl-10 transition duration-200 placeholder:text-gray-400
                    `}
                    style={{ boxShadow: 'none', borderColor: '#e5e7eb' }} 
                    aria-label={label}
                    autoComplete={name === 'password' || name === 'confirmPassword' ? 'new-password' : name}
                />
                
                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition duration-200">
                    {Icon && <Icon className="h-5 w-5" />} 
                </span>

                {type === 'password' && (
                    <button
                        type="button"
                        tabIndex="-1" 
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 p-2 hover:text-indigo-600 transition duration-150"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                        {isPasswordVisible ? 
                            <EyeSlashIcon className="h-5 w-5" /> 
                            : 
                            <EyeIcon className="h-5 w-5" />
                        }
                    </button>
                )}
            </div>
        </div>
    );
};


// --- Component Chính: App (Đổi tên thành RegistrationForm) ---
const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // TRẠNG THÁI MỚI CHO XÁC THỰC
    const [isVerificationStep, setIsVerificationStep] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [verificationCodes, setVerificationCodes] = useState([]);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [isResendingCode, setIsResendingCode] = useState(false);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Khi người dùng nhập lại vào form chính, xóa lỗi
        setErrorMessage(''); 
    };

    // --- Xử lý ĐĂNG KÝ (Bắt đầu Xác thực) ---
    const handleRegister = useCallback(async (e, shouldResend = false) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!shouldResend && formData.password !== formData.confirmPassword) {
            setErrorMessage("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.");
            return;
        }

        if (!formData.email || !formData.password || !formData.name) {
             setErrorMessage("Vui lòng điền đầy đủ thông tin.");
             return;
        }
        
        const setter = shouldResend ? setIsResendingCode : setIsSubmitting;
        setter(true);

        try {
            const response = await fetch(`${API_BASE_URL}/register-start-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                // Thành công: Chuyển sang bước xác thực
                setVerificationEmail(formData.email);
                setVerificationCodes(data.codes); // Lưu 4 mã code để hiển thị
                setIsVerificationStep(true);

                if (shouldResend) {
                    setErrorMessage('Đã gửi lại mã xác thực. Vui lòng kiểm tra email.');
                }
            } else {
                // Thất bại: Hiển thị lỗi API trả về
                setErrorMessage(data.message || "Đã xảy ra lỗi trong quá trình khởi tạo xác thực.");
            }
        } catch (error) {
            console.error('Lỗi khi gọi API khởi tạo xác thực:', error);
            setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        } finally {
            setter(false);
        }
    }, [formData]);

    // --- Xử lý XÁC THỰC Mã Code ---
    const handleVerify = async (code) => {
        setIsVerifyingCode(true);
        setErrorMessage(''); // Xóa lỗi cũ trên VerificationModal

        try {
            const response = await fetch(`${API_BASE_URL}/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verificationEmail, code }),
            });

            const data = await response.json();

            if (data.success) {
                // Hoàn tất đăng ký thành công!
                setIsVerificationStep(false);
                setShowSuccessModal(true);
                // Reset form
                setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
                setVerificationEmail('');
                setVerificationCodes([]);
            } else {
                // Mã xác thực sai hoặc hết hạn -> DÙNG setErrorMessage ĐỂ HIỂN THỊ TRÊN MODAL
                setErrorMessage(data.message || "Mã xác thực không hợp lệ.");
            }
        } catch (error) {
            console.error('Lỗi khi gọi API xác thực:', error);
            setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        } finally {
            setIsVerifyingCode(false);
        }
    };
    
    // Hàm xóa lỗi từ bên ngoài (cho VerificationModal)
    const clearExternalError = () => {
        setErrorMessage('');
    };

    // --- Xử lý Gửi lại Mã ---
    const handleResend = (e) => {
        // Gọi lại handleRegister nhưng với cờ shouldResend = true
        handleRegister(e, true);
    };

    // --- Hiển thị giao diện ---
    
    // Nếu đang ở bước xác thực, hiển thị modal thay vì form đăng ký
    if (isVerificationStep) {
        return (
            <VerificationModal 
                email={verificationEmail}
                codes={verificationCodes}
                onVerify={handleVerify}
                onResend={handleResend}
                onCancel={() => setIsVerificationStep(false)}
                isVerifying={isVerifyingCode}
                isResending={isResendingCode}
                externalError={errorMessage} // Pass errorMessage từ form chính vào modal
                clearExternalError={clearExternalError}
            />
        );
    }
    
    // Nếu không, hiển thị form đăng ký
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans antialiased">
            {/* Success Modal */}
            {showSuccessModal && (
                <SuccessModal 
                    message="Tài khoản của bạn đã được tạo và xác thực thành công! Bạn có thể đăng nhập ngay bây giờ." 
                    onClose={() => setShowSuccessModal(false)} 
                />
            )}
            
            <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100 transition duration-500 hover:shadow-3xl relative">
                
                <Link 
                    to="/" 
                    className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 transition duration-150 p-2 rounded-full hover:bg-indigo-50"
                    aria-label="Đóng form đăng ký"
                >
                    <XMarkIcon className="h-6 w-6" />
                </Link>

                <div className="mb-10 mt-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-1">
                        Tạo Tài Khoản Mới
                    </h1>
                    
                    <div className="text-gray-500 mt-2 text-base"> 
                        <div>Nếu bạn đã có tài khoản,</div>
                        <div className="mt-0.5">
                            <Link 
                                to="/login" 
                                className="text-indigo-600 font-semibold hover:underline transition duration-150 hover:text-indigo-700"
                            >
                                bạn có thể đăng nhập tại đây!
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Form nhập liệu */}
                <form onSubmit={handleRegister} className="space-y-2">
                    <InputField
                        label="Tên của bạn"
                        placeholder="Ví dụ: Chu Thủy Vân"
                        icon={UserIcon}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Địa chỉ Email"
                        placeholder="Ví dụ: hotro@email.com"
                        icon={EnvelopeIcon}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Số điện thoại"
                        placeholder="Chỉ nhập số, Ví dụ: 0912345678"
                        icon={PhoneIcon}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Mật khẩu"
                        placeholder="Ít nhất 6 ký tự"
                        icon={LockClosedIcon}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Nhập lại mật khẩu"
                        placeholder="Xác nhận lại mật khẩu"
                        icon={LockClosedIcon}
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    
                    {/* Hiển thị lỗi */}
                    {errorMessage && (
                        <div className="text-red-500 text-sm font-medium mt-4 p-2 bg-red-50 rounded-lg border border-red-200">
                            {errorMessage}
                        </div>
                    )}

                    {/* Nút Đăng ký */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                                w-full py-4 text-xl font-bold text-white 
                                bg-gradient-to-r from-indigo-600 to-blue-500 
                                rounded-xl shadow-lg 
                                hover:from-indigo-700 hover:to-blue-600 
                                transition duration-300 transform 
                                ${isSubmitting 
                                    ? 'opacity-60 cursor-not-allowed' 
                                    : 'hover:scale-[1.01] active:scale-98 shadow-indigo-300/50'}
                            `}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </div>
                            ) : (
                                "Đăng ký (Xác thực Email)"
                            )}
                        </button>
                    </div>
                </form>
                
                {/* Điều khoản */}
                <p className="text-center text-xs text-gray-400 mt-6 px-4">
                    Bằng việc đăng ký, bạn đồng ý với 
                    <a href="#" className="text-indigo-500 hover:text-indigo-700 hover:underline mx-1">Điều khoản Dịch vụ</a> 
                    và 
                    <a href="#" className="text-indigo-500 hover:text-indigo-700 hover:underline mx-1">Chính sách Bảo mật</a> 
                    của chúng tôi.
                </p>

            </div>
        </div>
    );
};

export default RegistrationForm;
