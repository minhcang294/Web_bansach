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

  if (cart.items.length === 0) {
    return (
      <div className="container page-wrap">
        <div className="empty-state">
          <ShoppingBag size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p>Giỏ hàng của bạn đang trống.</p>
          <Link to="/books" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrap">
      <h2 className="section-title">Giỏ hàng của bạn</h2>
      {error && <p className="form-error">{error}</p>}

      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div className="card" style={{ flex: "2 1 420px", overflow: "hidden" }}>
          {cart.items.map((item) => (
            <div className="cart-item-row" key={item.id}>
              <img src={item.imageUrl} alt={item.title} className="cart-item-img" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: "var(--wine-dark)", margin: "0 0 4px", fontSize: 14.5 }}>{item.title}</p>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>{formatCurrency(item.price)}</p>
              </div>
              <div className="qty-control">
                <button onClick={() => handleQtyChange(item, item.quantity - 1)}><Minus size={13} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQtyChange(item, item.quantity + 1)} disabled={item.quantity >= item.stockQuantity}>
                  <Plus size={13} />
                </button>
              </div>
              <p style={{ width: 100, textAlign: "right", fontWeight: 700, color: "var(--wine)", margin: 0 }}>
                {formatCurrency(item.subtotal)}
              </p>
              <button className="btn-danger-text" onClick={() => removeItem(item.id)} aria-label="Xóa">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="card" style={{ flex: "1 1 260px", padding: 22 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--wine-dark)", margin: "0 0 16px" }}>Tóm tắt đơn hàng</h3>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8, color: "var(--muted)" }}>
            <span>Tạm tính ({cart.totalQuantity} sản phẩm)</span>
            <span>{formatCurrency(cart.totalAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 16, color: "var(--muted)" }}>
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, color: "var(--wine)", borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 20 }}>
            <span>Tổng cộng</span>
            <span>{formatCurrency(cart.totalAmount)}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => navigate("/checkout")}>
            Tiến hành thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
