import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { orderApi } from "../api/orderApi.js";
import { formatCurrency } from "../utils/formatCurrency.js";

const STATUS_LABEL = {
  Pending: "Chờ xử lý", Confirmed: "Đã xác nhận", Shipping: "Đang giao", Completed: "Hoàn tất", Cancelled: "Đã hủy",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getById(id).then((res) => setOrder(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container page-wrap"><p>Đang tải...</p></div>;
  if (!order) return <div className="container page-wrap"><div className="empty-state">Không tìm thấy đơn hàng.</div></div>;

  return (
    <div className="container page-wrap" style={{ maxWidth: 700 }}>
      {location.state?.justPlaced && (
        <div className="form-success" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <CheckCircle size={18} /> Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại Hiệu Sách.
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--wine-dark)", margin: 0 }}>
            Đơn hàng #{order.id}
          </h2>
          <span className={`status-badge status-${order.status}`}>{STATUS_LABEL[order.status] || order.status}</span>
        </div>

        <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 4 }}>
          Ngày đặt: {new Date(order.orderDate).toLocaleString("vi-VN")}
        </p>
        <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 20 }}>
          Giao đến: {order.shippingAddress} • SĐT: {order.phoneNumber}
        </p>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          {order.items.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
              <span>{item.bookTitle} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, color: "var(--wine)", borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 8 }}>
          <span>Tổng cộng</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <Link to="/orders" className="btn btn-outline" style={{ marginTop: 20, display: "inline-flex" }}>Xem tất cả đơn hàng</Link>
    </div>
  );
}
