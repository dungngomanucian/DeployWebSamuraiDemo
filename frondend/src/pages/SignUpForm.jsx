import React, { useState } from 'react';
// Import các icons cần thiết
import { Mail, Lock, User, Phone, X, Eye, EyeOff } from 'lucide-react';

// Giả lập component Link cho môi trường Canvas/VS Code đơn giản.
// Trong dự án thực tế, bạn sẽ dùng: import { Link } from 'react-router-dom';
const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>;

/**
 * Component InputField tùy chỉnh
 * @param {string} label - Nhãn hiển thị cho trường nhập liệu
 * @param {string} placeholder - Placeholder
 * @param {object} icon: Icon - Component icon từ lucide-react
 * @param {string} type - Loại input (text, email, password, tel)
 * @param {string} name - Tên trường trong state (RẤT QUAN TRỌNG cho onChange)
 * @param {string} value - Giá trị hiện tại của input
 * @param {function} onChange - Hàm xử lý khi giá trị thay đổi
 */
const InputField = ({ label, placeholder, icon : Icon , type = 'text', name, value, onChange }) => {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	// Xác định type thực tế của input
	const inputType = (type === 'password' && isPasswordVisible) ? 'text' : type;

	// Xử lý thay đổi input nội bộ để lọc ký tự (chỉ cho phép số khi type='tel')
	const handleInputChange = (e) => {
		let newValue = e.target.value;
		let targetName = e.target.name;

		if (type === 'tel') {
			// Lọc bỏ tất cả các ký tự không phải là chữ số
			newValue = newValue.replace(/\D/g, '');
		}

		// Tạo một đối tượng event đã được lọc để truyền lên component cha
		const filteredEvent = {
			...e,
			target: {
				...e.target,
				name: targetName,
				value: newValue
			}
		};
		
		// Gọi hàm onChange gốc của component cha
		onChange(filteredEvent);
	};

	// Sử dụng group-focus để thay đổi màu icon khi input được focus
	return (
		<div className="w-full mb-6 group">
			<label className="text-base font-medium text-gray-700 block mb-1">
				{label}
			</label>
			<div className="relative">
				<input
					type={inputType}
					name={name} // Dùng name để handler biết trường nào đang thay đổi
					placeholder={placeholder}
					value={value}
					onChange={handleInputChange} // Sử dụng handler đã được chỉnh sửa
					className={`
						w-full py-3 px-0 border-t-0 border-l-0 border-r-0 border-b-2
						focus:outline-none focus:border-indigo-600 rounded-none bg-transparent
						text-lg pl-10 transition duration-200
					`}
					// Styling tùy chỉnh để đảm bảo chỉ có border dưới
					style={{ boxShadow: 'none', borderColor: '#d1d5db' }}
					aria-label={label}
				/>
				
				{/* Icon nằm bên trái, thay đổi màu khi focus */}
				<span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition duration-200">
					<Icon size={20} />
				</span>

				{/* Nút hiển thị/ẩn mật khẩu */}
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

// Component chính
const SignUpForm = () => {
	// 1. Dùng useState để lưu trữ dữ liệu thật của form
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
	});

	// Xử lý thay đổi input chung cho tất cả các trường
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleRegister = (e) => {
		e.preventDefault();
		
		// Kiểm tra đơn giản (ví dụ: mật khẩu khớp)
		if (formData.password !== formData.confirmPassword) {
			// Thay alert bằng thông báo hiển thị trên UI trong thực tế
			console.error("Lỗi: Mật khẩu xác nhận không khớp.");
			return;
		}

		// 2. Logic xử lý đăng ký (Gửi formData lên API/Server)
		console.log("Dữ liệu đăng ký:", formData);
		// Thay thế 'alert' bằng một modal/message box trong môi trường thực tế.
		alert("Đã gửi dữ liệu Đăng ký thành công. Kiểm tra console để xem dữ liệu form.");
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			{/* Container chính */}
			<div className="w-full max-w-lg bg-white p-8 md:p-12 rounded-xl shadow-2xl border border-gray-100 transition duration-500 hover:shadow-3xl relative">
				
				{/* Nút Đóng (quay lại trang chủ) */}
				<Link 
					to="/" 
					className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
					aria-label="Đóng form đăng ký"
				>
					<X size={24} />
				</Link>

				{/* Tiêu đề */}
				<div className="mb-10"> {/* Đã bỏ text-center */}
					<h1 className="text-4xl font-extrabold text-indigo-700 mb-2 text-center"> {/* Căn giữa H1 thủ công */}
						Tạo Tài Khoản Mới
					</h1>
					
					{/* Cập nhật theo yêu cầu: Căn sát trái */}
					
					<p className="text-gray-500 mt-6 text-lg text-left"> {/* Dòng 1: Căn trái */}
						Nếu bạn đã có tài khoản
					</p>
					
					<p className="text-gray-500 text-lg mt-0 text-left"> {/* Dòng 2 chứa link: Căn trái, căn chỉnh lại khoảng cách */}
						Bạn có thể
						<Link 
							to="/login" 
							className="text-indigo-600 font-semibold ml-1 hover:underline transition duration-150"
						>
							đăng nhập tại đây!
						</Link>
					</p>
					
				</div>


				{/* Form nhập liệu */}
				<form onSubmit={handleRegister} className="space-y-4">
					<InputField
						label="Tên của bạn"
						placeholder="Chu Thủy Vân"
						icon={User}
						name="name"
						value={formData.name}
						onChange={handleChange}
					/>
					<InputField
						label="Địa chỉ Email"
						placeholder="samurai@gmail.com"
						icon={Mail}
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
					/>
					<InputField
						label="Số điện thoại"
						placeholder="0962 *** ****"
						icon={Phone}
						type="tel" // Vẫn giữ type="tel" để kích hoạt bàn phím số trên di động
						name="phone"
						value={formData.phone}
						onChange={handleChange}
					/>
					<InputField
						label="Mật khẩu"
						placeholder="Mật khẩu (ít nhất 6 ký tự)"
						icon={Lock}
						type="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
					/>
					<InputField
						label="Nhập lại mật khẩu"
						placeholder="Nhập lại mật khẩu"
						icon={Lock}
						type="password"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleChange}
					/>
					
					{/* Nút Đăng ký */}
					<div className="pt-6">
						<button
							type="submit"
							className="w-full py-4 text-xl font-bold text-white 
								bg-gradient-to-r from-indigo-500 to-blue-600 
								rounded-lg shadow-lg 
								hover:from-indigo-600 hover:to-blue-700 
								transition duration-300 transform hover:scale-[1.01] hover:shadow-xl"
						>
							Đăng ký
						</button>
					</div>
				</form>
				
				<p className="text-center text-sm text-gray-400 mt-6">
						Bằng việc đăng ký, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.
				</p>

			</div>
		</div>
	);
};

export default SignUpForm;
