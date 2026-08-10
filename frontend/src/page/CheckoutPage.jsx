import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { orderApi } from "../api/orderApi.js";
import { formatCurrency } from "../utils/formatCurrency.js";

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      setError("Vui lòng nhập đầy đủ địa chỉ và số điện thoại.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await orderApi.create(address, phone);
      await refreshCart();
      navigate(`/orders/${res.data.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đặt hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return <div className="container page-wrap"><div className="empty-state">Giỏ hàng trống, không có gì để thanh toán.</div></div>;
  }

  return (
    <div className="container page-wrap">
      <h2 className="section-title">Thanh toán</h2>

      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
        <form className="card" style={{ flex: "1 1 340px", padding: 24 }} onSubmit={handleSubmit}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--wine-dark)", margin: "0 0 18px" }}>Thông tin giao hàng</h3>

          <label className="form-label" htmlFor="address">Địa chỉ giao hàng</label>
          <textarea
            id="address"
            className="form-input form-textarea"
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <label className="form-label" htmlFor="phone">Số điện thoại</label>
          <input
            id="phone"
            className="form-input"
            placeholder="0912345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Đang xử lý..." : `Đặt hàng • ${formatCurrency(cart.totalAmount)}`}
          </button>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, textAlign: "center" }}>
            Thanh toán khi nhận hàng (COD)
          </p>
        </form>

        <div className="card" style={{ flex: "1 1 280px", padding: 22 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--wine-dark)", margin: "0 0 16px" }}>Đơn hàng ({cart.totalQuantity} sản phẩm)</h3>
          {cart.items.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 10, color: "var(--text)" }}>
              <span style={{ maxWidth: 200 }}>{item.title} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, color: "var(--wine)", borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 8 }}>
            <span>Tổng cộng</span>
            <span>{formatCurrency(cart.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
