import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; 

const AdminAuthContext = createContext({
  isAdminLoggedIn: false,
  adminAccessToken: null,
  adminRefreshToken: null,
  // adminUser: null,
  login: (accessToken, refreshToken) => {},
  logout: () => {},
});

export const AdminAuthProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminAccessToken, setAdminAccessToken] = useState(null); // Bắt đầu bằng null
  const [adminRefreshToken, setAdminRefreshToken] = useState(null); // Bắt đầu bằng null
  const [adminUser, setAdminUser] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    setAdminAccessToken(null);
    setAdminRefreshToken(null);
    setAdminUser(null);
    setIsAdminLoggedIn(false);
  }, []);

  // Tách logic xác thực token ra một hàm riêng để tái sử dụng
  const validateAndSetAuth = useCallback((accessToken, refreshToken) => {
    if (!accessToken || !refreshToken) {
      logout();
      return false;
    }

    try {
      const decoded = jwtDecode(accessToken);
      
      // --- (RẤT QUAN TRỌNG) ---
      // Kiểm tra xem token của bạn có trường 'role' và giá trị 'admin' không
      // Nếu tên trường khác (ví dụ: 'is_admin': true), hãy sửa lại điều kiện if bên dưới
      const isValid = decoded.exp * 1000 > Date.now() && decoded.role === 'admin';
      
      if (isValid) {
        // Nếu hợp lệ: Lưu vào localStorage VÀ state
        localStorage.setItem('adminAccessToken', accessToken);
        localStorage.setItem('adminRefreshToken', refreshToken);
        setAdminAccessToken(accessToken);
        setAdminRefreshToken(refreshToken);
        setAdminUser({ id: decoded.user_id, email: decoded.email }); // Ví dụ
        setIsAdminLoggedIn(true);
        return true;
      } else {
        // Nếu token hết hạn hoặc sai role
        logout();
        return false;
      }
    } catch (error) {
      // Nếu token không hợp lệ (không giải mã được)
      console.error("Invalid admin token:", error);
      logout();
      return false;
    }
  }, [logout]); // Thêm logout vào dependencies

  // Kiểm tra token khi component mount lần đầu
  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    const refresh = localStorage.getItem('adminRefreshToken');
    if (token && refresh) {
      validateAndSetAuth(token, refresh);
    }
    // Chỉ chạy 1 lần khi load app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // validateAndSetAuth đã được bọc trong useCallback nên không cần đưa vào đây

  // Hàm login bây giờ sẽ SỬ DỤNG LẠI logic validate
  const login = useCallback((accessToken, refreshToken) => {
    // Chỉ cần gọi hàm validate, nó sẽ tự set localStorage và state
    validateAndSetAuth(accessToken, refreshToken);
  }, [validateAndSetAuth]);


  const contextValue = useMemo(() => ({
    isAdminLoggedIn,
    adminAccessToken,
    adminRefreshToken,
    // adminUser,
    login,
    logout,
  }), [isAdminLoggedIn, adminAccessToken, adminRefreshToken, login, logout]);

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);