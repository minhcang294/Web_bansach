import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./page/HomePage.jsx";
import BookListPage from "./page/BookListPage.jsx";
import BookDetailPage from "./page/BookDetailPage.jsx";
import CartPage from "./page/CartPage.jsx";
import CheckoutPage from "./page/CheckoutPage.jsx";
import LoginPage from "./page/loginpage.jsx";
import RegisterPage from "./page/RegisterPage.jsx";
import OrderHistoryPage from "./page/OrderHistoryPage.jsx";
import OrderDetailPage from "./page/OrderDetailPage.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

// Chặn truy cập nếu chưa đăng nhập
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Layout quản lý hiển thị Header/Footer
function AppLayout() {
  const location = window.location.pathname;
  const isAuthPage = location === "/login" || location === "/register";

  return (
    <>
      {!isAuthPage && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BookListPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAuthPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppLayout />
      </CartProvider>
    </AuthProvider>
  );
}