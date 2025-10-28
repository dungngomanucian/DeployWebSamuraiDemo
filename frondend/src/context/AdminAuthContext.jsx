import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
// (Tùy chọn) Cần thư viện để giải mã token nếu muốn kiểm tra expiry/role khi load
// import { jwtDecode } from 'jwt-decode'; 

const AdminAuthContext = createContext({
  isAdminLoggedIn: false,
  adminAccessToken: null,
  adminRefreshToken: null,
  // adminUser: null, // Có thể thêm nếu muốn lưu thông tin user
  login: (accessToken, refreshToken) => {}, // Hàm placeholder
  logout: () => {}, // Hàm placeholder
});

export const AdminAuthProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminAccessToken, setAdminAccessToken] = useState(localStorage.getItem('adminAccessToken'));
  const [adminRefreshToken, setAdminRefreshToken] = useState(localStorage.getItem('adminRefreshToken'));
  // const [adminUser, setAdminUser] = useState(null);

  // Kiểm tra token khi component mount lần đầu
  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    const refresh = localStorage.getItem('adminRefreshToken');
    
    // Logic kiểm tra token hợp lệ đơn giản (chỉ check tồn tại)
    // Nâng cao: Dùng jwtDecode để kiểm tra expiry và role
    if (token && refresh) {
        // try {
        //   const decoded = jwtDecode(token);
        //   if (decoded.exp * 1000 > Date.now() && decoded.role === 'admin') {
               setIsAdminLoggedIn(true);
               setAdminAccessToken(token);
               setAdminRefreshToken(refresh);
        //     setAdminUser({ id: decoded.user_id, email: decoded.email }); // Ví dụ
        //   } else {
        //     // Token hết hạn hoặc sai role -> logout
        //     logout(); 
        //   }
        // } catch (error) {
        //   console.error("Invalid admin token on load:", error);
        //   logout(); // Token không hợp lệ
        // }
    } else {
      setIsAdminLoggedIn(false); // Không có token -> chưa đăng nhập
    }
  }, []); // Chỉ chạy 1 lần

  const login = useCallback((accessToken, refreshToken) => {
    localStorage.setItem('adminAccessToken', accessToken);
    localStorage.setItem('adminRefreshToken', refreshToken);
    setAdminAccessToken(accessToken);
    setAdminRefreshToken(refreshToken);
    setIsAdminLoggedIn(true);
    // (Tùy chọn) Giải mã token để lấy user info và setAdminUser
    // try {
    //   const decoded = jwtDecode(accessToken);
    //   setAdminUser({ id: decoded.user_id, email: decoded.email });
    // } catch (error) {
    //   console.error("Failed to decode token on login:", error);
    //   setAdminUser(null);
    // }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    setAdminAccessToken(null);
    setAdminRefreshToken(null);
    setIsAdminLoggedIn(false);
    // setAdminUser(null);
    // Có thể thêm navigate('/admin/login') ở đây nếu Provider được đặt sau BrowserRouter
  }, []);

  // Dùng useMemo để tối ưu giá trị context
  const contextValue = useMemo(() => ({
    isAdminLoggedIn,
    adminAccessToken,
    adminRefreshToken,
    // adminUser,
    login,
    logout,
  }), [isAdminLoggedIn, adminAccessToken, adminRefreshToken, login, logout]); // Thêm login, logout vào dependencies

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Hook tùy chỉnh
export const useAdminAuth = () => useContext(AdminAuthContext);