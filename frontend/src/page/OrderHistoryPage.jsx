import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Trash2 } from "lucide-react";

const formatCurrency = (amount) => {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
};

const STATUS_LABEL = {
  "Chờ xử lý": "Chờ xử lý",
  "ChoXuLy": "Chờ xử lý",
  "Đã xác nhận": "Đã xác nhận",
  "DaXacNhan": "Đã xác nhận",
  "Đang giao": "Đang giao",
  "DangGiao": "Đang giao",
  "Hoàn tất": "Hoàn tất",
  "HoanTat": "Hoàn tất",
  "Đã hủy": "Đã hủy",
  "DaHuy": "Đã hủy"
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (e, orderId) => {
    e.preventDefault();   
    e.stopPropagation();  

    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`)) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Đã hủy" }) 
      });

      if (response.ok) {
        alert("Đã hủy đơn hàng thành công!");
        fetchMyOrders(); 
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Không thể hủy đơn. Backend báo lỗi: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API hủy đơn:", error);
      alert("Có lỗi mạng xảy ra. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="container page-wrap" style={{ textAlign: 'center', padding: '40px' }}>
        <p>Đang tải dữ liệu đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container page-wrap">
        <div className="empty-state" style={{ textAlign: 'center', padding: '50px 0' }}>
          <Package size={50} style={{ marginBottom: 15, color: '#ccc' }} />
          <p style={{ color: '#666', fontSize: '16px' }}>Bạn chưa có đơn hàng nào.</p>
          <Link to="/books" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex", padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
            Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-wrap">
      <h2 className="section-title" style={{ marginBottom: '20px', color: '#2c3e50' }}>Đơn hàng của tôi</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: '16px' }}>
        {orders.map((o) => {
          const statusStr = o.status ? o.status.trim() : "";
          const isPending = statusStr === "Chờ xử lý" || statusStr === "ChoXuLy";
          const isCancelled = statusStr === "Đã hủy" || statusStr === "DaHuy";

          return (
            <Link 
              key={o.id} 
              to={`/orders/${o.id}`} 
              style={{ 
                padding: '20px', 
                display: "block", 
                textDecoration: "none",
                borderRadius: '8px',
                border: '1px solid #eaeaea',
                transition: 'box-shadow 0.2s',
                backgroundColor: '#fff'
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: '15px' }}>
                
                {/* Bên trái: Thông tin mã đơn & Ngày đặt */}
                <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                  <p style={{ fontWeight: 700, color: "var(--wine-dark, #2c3e50)", margin: "0 0 6px", fontSize: '16px' }}>
                    Đơn hàng #{o.id}
                  </p>
                  <p style={{ fontSize: '13.5px', color: "var(--muted, #7f8c8d)", margin: 0 }}>
                    {new Date(o.orderDate || Date.now()).toLocaleDateString("vi-VN")} • {o.items?.length || o.orderItems?.length || 1} sản phẩm
                  </p>
                </div>

                {/* Bên phải: Trạng thái, Tổng tiền & Nút Hủy */}
                <div style={{ display: "flex", alignItems: "center", gap: '24px', flexWrap: "nowrap" }}>
                  
                  {/* Badge trạng thái */}
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: isPending ? '#e1f5fe' : (isCancelled ? '#fdedec' : '#f0f3f4'),
                    color: isPending ? '#0288d1' : (isCancelled ? '#e74c3c' : '#555')
                  }}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                  
                  {/* Giá tiền */}
                  <span style={{ 
                    fontWeight: 700, 
                    color: "#e74c3c", 
                    fontSize: '17px',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatCurrency(o.totalAmount)}
                  </span>

                  {/* Nút hủy đơn: Chỉ hiển thị khi đang ở trạng thái Chờ xử lý */}
                  {isPending && (
                    <button
                      onClick={(e) => handleCancelOrder(e, o.id)}
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 600,
                        fontSize: "13.5px",
                        whiteSpace: 'nowrap',
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fecaca"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                      title="Hủy đơn hàng này"
                    >
                      <Trash2 size={16} /> Hủy đơn
                    </button>
                  )}
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}