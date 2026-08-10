import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cartApi } from "../api/cartApi.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Lấy thêm hàm logout từ AuthContext để dọn dẹp nếu token hết hạn
  const { isAuthenticated, logout } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, totalQuantity: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    // Nếu chưa đăng nhập, dọn dẹp giỏ hàng và không gọi API
    if (!isAuthenticated) {
      setCart({ items: [], totalAmount: 0, totalQuantity: 0 });
      return;
    }
    
    try {
      const res = await cartApi.get();
      setCart(res.data);
    } catch (error) {
      // Nếu Backend trả về 401 (Token hết hạn / Không hợp lệ)
      if (error.response?.status === 401) {
        setCart({ items: [], totalAmount: 0, totalQuantity: 0 }); // Xóa giỏ hàng ảo
        if (logout) logout(); // Ép đăng xuất để xóa token hỏng khỏi hệ thống
      } else {
        console.error("Lỗi khi tải giỏ hàng:", error);
      }
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (bookId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await cartApi.add(bookId, quantity);
      setCart(res.data);
      return { success: true };
    } catch (err) {
      // Tương tự, nếu đang thêm giỏ hàng mà bị 401 thì xử lý luôn
      if (err.response?.status === 401) {
        if (logout) logout();
        return { success: false, message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." };
      }
      return { success: false, message: err.response?.data?.message || "Không thể thêm vào giỏ hàng." };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await cartApi.updateQuantity(cartItemId, quantity);
      setCart(res.data);
      return { success: true };
    } catch (err) {
      if (err.response?.status === 401 && logout) logout();
      return { success: false, message: err.response?.data?.message || "Không thể cập nhật số lượng." };
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await cartApi.remove(cartItemId);
      setCart(res.data);
    } catch (err) {
      if (err.response?.status === 401 && logout) logout();
      console.error("Lỗi khi xóa sản phẩm:", err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải dùng bên trong CartProvider");
  return ctx;
}