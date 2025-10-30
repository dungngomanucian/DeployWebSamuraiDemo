import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../../api/admin/authAdminService'; 
import { useAdminAuth } from '../../../context/AdminAuthContext'; 
import logo from '../../../assets/logo.png'; 

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setLoading(true);
    setError(''); // Xoá lỗi cũ
    console.log('Tài khoản admin gửi lên:',{ email, password });
    try {
      const { data, error: apiError } = await adminLogin(email, password);
      
      if (apiError) {
        // Nếu API trả về lỗi (sai pass, sai email)
        setError(apiError.detail || 'Sai mật khẩu hoặc email');
        return; // Dừng hàm
      }

      if (data && data.access && data.refresh) {
        // Thành công
        login(data.access, data.refresh); 
        navigate('/admin/dashboard'); 
      } else {
        // Không có data mà cũng không báo lỗi (ít xảy ra)
        setError('Không nhận được token từ server.');
      }

    } catch (err) {
      // Lỗi mạng hoặc lỗi code
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      console.error('Admin login error:', err);
    } finally {
      setLoading(false); // Luôn tắt loading
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <figure className="px-10 pt-10">
          <img src={logo} alt="Logo" className="w-48" />
        </figure>
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">Admin Login</h2>
          
          {/* --- SỬA LỖI CĂN CHỈNH TẠI ĐÂY --- */}
          {error && (
            <div className="alert alert-error shadow-lg mb-4">
              {/* Đã xoá thẻ <div> thừa bọc ngoài SVG và span */}
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}
          {/* --- KẾT THÚC SỬA --- */}

          <form onSubmit={handleSubmit} className="space-y-4"> 
            
            {/* Hàng Email */}
            <div className="form-control">
              <label className="label" htmlFor="email-input">
                <span className="label-text">Email</span>
              </label>
              <input
                id="email-input"
                type="email"
                placeholder="email@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Hàng Password */}
            <div className="form-control">
              <label className="label" htmlFor="password-input">
                <span className="label-text">Password</span>
              </label>
              <input
                id="password-input"
                type="password"
                placeholder="********"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {/* Nút căn giữa */}
            <div className="mt-6 flex justify-center"> 
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}