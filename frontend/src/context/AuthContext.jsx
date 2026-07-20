import React, { createContext, useContext, useState } from "react";
import { authApi } from "../api/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Hàm khởi tạo an toàn: Nếu localStorage bị lỗi JSON, trả về null
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Lỗi khi parse user từ localStorage:", error);
      return null;
    }
  });

  const login = (userData) => {
    // Lưu user vào state và localStorage
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    authApi.logout(); // Gọi hàm xóa session từ API (nếu có)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Helper để kiểm tra quyền
  const hasRole = (role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user, // Chuyển thành boolean
      hasRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }
  return context;
}