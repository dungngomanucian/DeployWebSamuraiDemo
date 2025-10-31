// src/context/AdminAuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; 

const AdminAuthContext = createContext({
  isAdminLoggedIn: false,
  adminAccessToken: null,
  adminRefreshToken: null,
  adminUser: null, // <-- Thêm placeholder
  login: (accessToken, refreshToken) => {},
  logout: () => {},
});

export const AdminAuthProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminAccessToken, setAdminAccessToken] = useState(null); 
  const [adminRefreshToken, setAdminRefreshToken] = useState(null); 
  const [adminUser, setAdminUser] = useState(null); // <-- State này đã có

  const logout = useCallback(() => {
    // ... (code logout giữ nguyên)
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    setAdminAccessToken(null);
    setAdminRefreshToken(null);
    setAdminUser(null);
    setIsAdminLoggedIn(false);
  }, []);

  const validateAndSetAuth = useCallback((accessToken, refreshToken) => {
    // ... (code validateAndSetAuth giữ nguyên)
    if (!accessToken || !refreshToken) {
      logout();
      return false;
    }
    try {
      const decoded = jwtDecode(accessToken);
      const isValid = decoded.exp * 1000 > Date.now() && decoded.role === 'admin';
      
      if (isValid) {
        localStorage.setItem('adminAccessToken', accessToken);
        localStorage.setItem('adminRefreshToken', refreshToken);
        setAdminAccessToken(accessToken);
        setAdminRefreshToken(refreshToken);
        // Đảm bảo bạn đang set email ở đây
        setAdminUser({ id: decoded.user_id, email: decoded.email }); 
        setIsAdminLoggedIn(true);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error("Invalid admin token:", error);
      logout();
      return false;
    }
  }, [logout]); 

  // ... (useEffect và hàm login giữ nguyên) ...
  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    const refresh = localStorage.getItem('adminRefreshToken');
    if (token && refresh) {
      validateAndSetAuth(token, refresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((accessToken, refreshToken) => {
    validateAndSetAuth(accessToken, refreshToken);
  }, [validateAndSetAuth]);


  // --- SỬA TẠI ĐÂY ---
  // Thêm 'adminUser' vào contextValue
  const contextValue = useMemo(() => ({
    isAdminLoggedIn,
    adminAccessToken,
    adminRefreshToken,
    adminUser, // <-- THÊM VÀO ĐÂY
    login,
    logout,
  }), [isAdminLoggedIn, adminAccessToken, adminRefreshToken, adminUser, login, logout]); // <-- VÀ THÊM VÀO ĐÂY

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);