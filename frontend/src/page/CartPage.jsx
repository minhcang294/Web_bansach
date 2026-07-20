import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleQtyChange = async (item, newQty) => {
    if (newQty < 1) return;
    setError("");
    const res = await updateQuantity(item.id, newQty);
    if (!res.success) setError(res.message);
  };

  // Trạng thái: Giỏ hàng trống
  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center", minHeight: "50vh" }}>
        <ShoppingBag size={64} style={{ marginBottom: 16, color: "#ccc" }} />
        <h3 style={{ fontSize: 24, marginBottom: 10, color: "#333" }}>Giỏ hàng của bạn đang trống</h3>
        <p style={{ color: "#777", marginBottom: 20 }}>Hãy quay lại trang chủ để chọn những cuốn sách thật hay nhé!</p>
        <Link to="/books" style={{ display: "inline-flex", padding: "12px 24px", background: "#e60023", color: "white", borderRadius: "8px", fontWeight: 700 }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // Trạng thái: Có sản phẩm
  return (
    <div className="container" style={{ padding: "40px 20px", minHeight: "70vh" }}>
      <h2 style={{ fontSize: 28, color: "#333", marginBottom: 30, borderBottom: "2px solid #e60023", paddingBottom: 10, display: "inline-block" }}>
        Giỏ hàng của bạn
      </h2>
      
      {error && (
        <p style={{ color: "#dc2626", background: "#fee2e2", padding: "10px 15px", borderRadius: 6, marginBottom: 20 }}>
          {error}
        </p>
      )}

      {/* Vùng chia 2 cột */}
      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* === CỘT TRÁI: DANH SÁCH SẢN PHẨM === */}
        <div style={{ flex: "1 1 60%", background: "white", borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
          {cart.items.map((item, index) => (
            <div 
              key={item.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center", 
                gap: "20px", 
                padding: "20px", 
                borderBottom: index !== cart.items.length - 1 ? "1px solid #eee" : "none",
                flexWrap: "wrap" 
              }}
            >
              {/* KHỐI 1: ẢNH + TÊN SÁCH */}
              <div style={{ display: "flex", gap: "15px", alignItems: "center", flex: "1 1 250px" }}>
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  style={{ width: "75px", height: "110px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee", flexShrink: 0 }} 
                />
                <div>
                  <Link to={`/books/${item.id}`} style={{ fontWeight: 700, color: "#333", fontSize: "16px", display: "block", marginBottom: 8, lineHeight: 1.4 }}>
                    {item.title}
                  </Link>
                  <p style={{ fontSize: "14px", color: "#e60023", fontWeight: 600, margin: 0 }}>
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </div>
              
              {/* KHỐI 2: ĐIỀU KHIỂN (SỐ LƯỢNG, GIÁ, XÓA) */}
              <div style={{ display: "flex", alignItems: "center", gap: "25px", flexWrap: "wrap" }}>
                <div className="qty-control-custom">
                  <button onClick={() => handleQtyChange(item, item.quantity - 1)} type="button">
                    <Minus size={16} />
                  </button>
                  <span className="qty-value-custom">{item.quantity}</span>
                  <button onClick={() => handleQtyChange(item, item.quantity + 1)} disabled={item.quantity >= item.stockQuantity} type="button">
                    <Plus size={16} />
                  </button>
                </div>
                
                <p style={{ width: "90px", textAlign: "right", fontWeight: 700, color: "#e60023", fontSize: "16px", margin: 0 }}>
                  {formatCurrency(item.subtotal)}
                </p>
                
                {/* KHẮC PHỤC LỖI THÙNG RÁC RỚT DÒNG */}
                <button 
                  onClick={() => removeItem(item.id)} 
                  title="Xóa khỏi giỏ hàng"
                  type="button"
                  style={{ 
                    width: "auto",      /* Hủy width: 100% mặc định */
                    marginTop: 0,       /* Hủy margin-top: 10px mặc định */
                    background: "none", 
                    border: "none", 
                    color: "#999", 
                    cursor: "pointer", 
                    padding: "8px", 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "0.2s" 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#e60023"}
                  onMouseOut={(e) => e.currentTarget.style.color = "#999"}
                >
                  <Trash2 size={20} />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* === CỘT PHẢI: TÓM TẮT ĐƠN HÀNG === */}
        <div style={{ flex: "1 1 320px", background: "white", padding: "25px", borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #eee", position: "sticky", top: "100px" }}>
          <h3 style={{ fontSize: "20px", color: "#333", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
            Tóm tắt đơn hàng
          </h3>
          
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", marginBottom: "12px", color: "#555" }}>
            <span>Tạm tính ({cart.totalQuantity} sản phẩm)</span>
            <span style={{ fontWeight: 600, color: "#333" }}>{formatCurrency(cart.totalAmount)}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", marginBottom: "20px", color: "#555" }}>
            <span>Phí vận chuyển</span>
            <span style={{ color: "#2e7d32", fontWeight: 600 }}>Miễn phí</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, color: "#e60023", borderTop: "2px solid #eee", paddingTop: "20px", marginBottom: "25px" }}>
            <span>Tổng cộng</span>
            <span>{formatCurrency(cart.totalAmount)}</span>
          </div>
          
          <button 
            type="button"
            onClick={() => navigate("/checkout")}
            style={{ width: "100%", padding: "14px", background: "#e60023", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "16px", cursor: "pointer", transition: "0.3s" }}
            onMouseOver={(e) => e.currentTarget.style.background = "#c7001b"}
            onMouseOut={(e) => e.currentTarget.style.background = "#e60023"}
          >
            Tiến hành thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}