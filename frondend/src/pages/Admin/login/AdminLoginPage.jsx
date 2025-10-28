import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../../api/admin/authAdminService'; 
import { useAdminAuth } from '../../../context/AdminAuthContext'; // <-- Import hook
import logo from '../../../assets/logo.png'; 

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth(); // <-- Lấy hàm login từ context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: apiError } = await adminLogin(email, password);
      console.log('Tài khoản admin gửi lên:',data);
      if (apiError) {
        throw new Error(apiError.detail || apiError.non_field_errors?.join(', ') || apiError || 'Đăng nhập thất bại.');
      }

      if (data && data.access && data.refresh) {
        // Lưu token vào localStorage VÀ cập nhật context
        login(data.access, data.refresh); // <-- Gọi hàm login từ context

        navigate('/admin/dashboard'); 
      } else {
        throw new Error('Không nhận được token từ server.');
      }

    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
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
          
          {error && (
            <div className="alert alert-error shadow-lg mb-4">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="********"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              {/* Optional: Add forgot password link here */}
            </div>
            <div className="form-control mt-6">
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