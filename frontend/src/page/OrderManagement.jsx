import React, { useState, useEffect } from 'react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // 1. ĐÃ ĐỔI ĐƯỜNG DẪN THÊM "/all" CHO ADMIN
      const response = await fetch('http://localhost:5000/api/orders/all', {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("DỮ LIỆU TỪ BACKEND:", data); // In ra để kiểm tra
        setOrders(Array.isArray(data) ? data : []);
      } else {
        console.error("Lỗi tải đơn hàng:", response.status);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Xác nhận chuyển trạng thái đơn ${orderId} sang "${newStatus}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        alert('Cập nhật thành công!');
        fetchOrders(); // Load lại dữ liệu mới
      } else {
        alert('Cập nhật thất bại! Vui lòng kiểm tra quyền truy cập.');
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert('Có lỗi xảy ra.');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Quản lý Đơn hàng</h2>
      
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f8', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Mã Đơn</th>
              <th style={{ padding: '15px' }}>Ngày đặt</th>
              <th style={{ padding: '15px' }}>Tổng tiền</th>
              <th style={{ padding: '15px' }}>Trạng thái</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                // 2. SỬ DỤNG TÊN BIẾN TIẾNG ANH THEO ĐÚNG DTO CỦA C#
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{order.id}</td>
                  
                  {/* Hiển thị ngày đặt hàng (vì DTO hiện chưa có tên khách hàng) */}
                  <td style={{ padding: '15px' }}>
                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                  </td>
                  
                  <td style={{ padding: '15px', color: '#e74c3c', fontWeight: 'bold' }}>
                    {order.totalAmount?.toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ padding: '5px 10px', borderRadius: '15px', backgroundColor: '#e1f5fe', fontSize: '12px', fontWeight: 'bold', color: '#0288d1' }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <select 
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)} 
                      value={order.status}
                      style={{ padding: '5px', borderRadius: '4px' }}
                    >
                      <option value="ChoXuLy">Chờ xử lý</option>
                      <option value="DaXacNhan">Đã xác nhận</option>
                      <option value="DangGiao">Đang giao</option>
                      <option value="HoanTat">Hoàn tất</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;