import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { orderApi } from "../api/orderApi.js";
import { formatCurrency } from "../utils/formatCurrency.js";

const STATUS_LABEL = {
  Pending: "Chờ xử lý",
  Confirmed: "Đã xác nhận",
  Shipping: "Đang giao",
  Completed: "Hoàn tất",
  Cancelled: "Đã hủy",
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders().then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container page-wrap"><p>Đang tải...</p></div>;

  if (orders.length === 0) {
    return (
      <div className="container page-wrap">
        <div className="empty-state">
          <Package size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/books" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>Mua sắm ngay</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrap">
      <h2 className="section-title">Đơn hàng của tôi</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="card" style={{ padding: 18, display: "block" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <p style={{ fontWeight: 700, color: "var(--wine-dark)", margin: "0 0 4px" }}>Đơn hàng #{o.id}</p>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                  {new Date(o.orderDate).toLocaleDateString("vi-VN")} • {o.items.length} sản phẩm
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span className={`status-badge status-${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span>
                <span style={{ fontWeight: 700, color: "var(--wine)" }}>{formatCurrency(o.totalAmount)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
