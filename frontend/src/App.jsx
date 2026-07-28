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
import ForgotPassword from './page/ForgotPassword';
import SearchPage from "./page/SearchPage"; 
import AboutPage from "./page/AboutPage";

// ================= PAGES (ADMIN & STAFF) =================
import Dashboard from "./page/Dashboard";
import BookManagement from "./page/BookManagement";
import CategoryManagement from "./page/CategoryManagement"; 
import OrderManagement from "./page/OrderManagement";
import UserManagement from "./page/UserManagement"; 
import ReportsPage from "./page/ReportsPage"; 
import StaffDashboard from "./page/StaffDashboard"; 
import ImportManagement from "./page/ImportManagement";

// ================= CONTEXTS & PROVIDERS =================
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { GoogleOAuthProvider } from '@react-oauth/google'; 

import "./App.css";

// Component bảo vệ Route dựa trên quyền hạn
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppLayout = () => {
  const { pathname } = useLocation();
  const hideLayout = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname.startsWith("/admin");

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* ================= USER ROUTES ================= */}
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

          {/* ================= STAFF ROUTES ================= */}
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />

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
            <Route path="categories" element={<CategoryManagement />} /> 
            <Route path="imports" element={<ImportManagement />} /> {/* <-- THÊM ROUTE QUẢN LÝ NHẬP KHO */}
            <Route path="orders" element={<OrderManagement />} /> 
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<ReportsPage />} />
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
    <GoogleOAuthProvider clientId="374277680791-3ippi6k8mjq04l78qk8nvjjgu9oqhlte.apps.googleusercontent.com">
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}