import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// ================= COMPONENTS & LAYOUTS =================
import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminLayout from "./components/AdminLayout";

// ================= PAGES (FRONTEND) =================
import HomePage from "./page/HomePage";
import BookListPage from "./page/BookListPage";
import BookDetailPage from "./page/BookDetailPage";
import CartPage from "./page/CartPage";
import CheckoutPage from "./page/CheckoutPage";
import LoginPage from "./page/loginpage"; 
import RegisterPage from "./page/RegisterPage";
import OrderHistoryPage from "./page/OrderHistoryPage";
import OrderDetailPage from "./page/OrderDetailPage";

// ================= PAGES (ADMIN) =================
import Dashboard from "./page/Dashboard";
import BookManagement from "./page/BookManagement";
import OrderManagement from "./page/OrderManagement";
import UserManagement from "./page/UserManagement"; 

// ================= CONTEXTS =================
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import "./App.css";

// Component bảo vệ Route dựa trên quyền hạn
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Kiểm tra nếu có phân quyền và role của user không thỏa mãn
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppLayout = () => {
  const { pathname } = useLocation();
  // Ẩn Header/Footer ở trang đăng nhập, đăng ký và khu vực Admin
  const hideLayout = pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin");

  return (
    <div className="app">
      {!hideLayout && <Header />}

      <main className={hideLayout ? "admin-main" : "main-content"}>
        <Routes>
          {/* ================= FRONTEND ROUTES ================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ================= USER ROUTES ================= */}
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="books" element={<BookManagement />} />
            <Route path="orders" element={<OrderManagement />} /> 
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Redirect mọi route không hợp lệ về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppLayout />
      </CartProvider>
    </AuthProvider>
  );
}