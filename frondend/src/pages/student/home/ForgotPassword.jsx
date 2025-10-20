import React, { useState } from "react";
import { Mail, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { studentApiClient } from "../../../api/axiosConfig";

// Giả lập component Link cho môi trường demo (Canvas/VSCode)
const Link = ({ to, children, className }) => (
  <a href={to} className={className}>
    {children}
  </a>
);

// Component InputField tái sử dụng
const InputField = ({
  label,
  placeholder,
  icon: Icon,
  type = "text",
  name,
  value,
  onChange,
}) => (
  <div className="w-full mb-6 group">
    <label className="text-base font-medium text-gray-700 block mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          w-full py-3 px-0 border-t-0 border-l-0 border-r-0 border-b-2
          focus:outline-none focus:border-indigo-600 rounded-none bg-transparent
          text-lg pl-10 transition duration-200
        "
        style={{ boxShadow: "none", borderColor: "#d1d5db" }}
        aria-label={label}
      />

      <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition duration-200">
        <Icon size={20} />
      </span>
    </div>
  </div>
);

// ===== Component chính: Form Quên Mật Khẩu =====
const ForgotPasswordForm = () => {
  const [formData, setFormData] = useState({ email: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập địa chỉ Gmail của bạn.");
      return;
    }

    if (!emailPattern.test(formData.email)) {
      toast.error(
		<div>
			Hãy nhập địa chỉ Gmail hợp lệ! <br />
    		(ví dụ: SamuraiJapanese@gmail.com)
		</div>
	  );
      return;
    }

    try {
      const response = await studentApiClient.post("/student/forgot-password/", {
        email: formData.email,
      });


      if (response.data?.message) {
        toast.success("Đã gửi liên kết đặt lại mật khẩu!");
      } else {
        toast.error(response.data?.error || "Có lỗi xảy ra khi gửi yêu cầu.");
      }
    } catch (error) {
      console.error("Lỗi gửi yêu cầu:", error);
      // Xử lý lỗi riêng khi email không tồn tại
      if (error.response?.status === 404) {
        toast.error("Email không tồn tại trong hệ thống.");
      } else {
        toast.error("Không thể gửi yêu cầu, vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Container */}
      <div className="w-full max-w-lg bg-white p-8 md:p-12 rounded-xl shadow-2xl border border-gray-100 transition duration-500 hover:shadow-3xl relative">
        {/* Nút quay lại trang chủ */}
        <Link
          to="/"
          className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
          aria-label="Đóng form quên mật khẩu"
        >
          <X size={24} />
        </Link>

        {/* Tiêu đề */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-700 mb-3">
            Quên mật khẩu
          </h1>
          <p className="text-gray-500 text-lg">
            Nhập địa chỉ Gmail đã đăng ký 
          </p>
		  <p className="text-gray-500 text-lg">
            để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="space-y-6">
          	<InputField
				label="Địa chỉ Gmail"
				placeholder="samurai@gmail.com"
				icon={Mail}
				type="text" // <-- đổi từ "email" sang "text"
				name="email"
				value={formData.email}
				onChange={handleChange}
			/>


          <button
            type="submit"
            className="w-full py-4 text-xl font-bold text-white 
              bg-gradient-to-r from-indigo-500 to-blue-600 
              rounded-lg shadow-lg 
              hover:from-indigo-600 hover:to-blue-700 
              transition duration-300 transform hover:scale-[1.01] hover:shadow-xl"
          >
            Gửi yêu cầu
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
        	Sau khi gửi, vui lòng kiểm tra hộp thư Gmail của bạn <br />
			(bao gồm cả mục Spam).
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
