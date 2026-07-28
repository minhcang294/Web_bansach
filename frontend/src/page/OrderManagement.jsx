import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaTimes, FaTrashAlt } from 'react-icons/fa';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders/all', {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) : [];
        setOrders(sortedData);
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
        fetchOrders();
      } else {
        alert('Cập nhật thất bại! Vui lòng kiểm tra lại.');
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert('Có lỗi xảy ra.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA đơn hàng ${orderId} này không? Hành động này không thể hoàn tác!`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.ok) {
        alert('Xóa đơn hàng thành công!');
        fetchOrders(); 
      } else {
        alert('Xóa thất bại! Đơn hàng có thể đang bị ràng buộc dữ liệu.');
      }
    } catch (error) {
      console.error("Lỗi xóa đơn hàng:", error);
      alert('Có lỗi xảy ra khi xóa.');
    }
  };

  const handleViewDetail = async (order) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${order.id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
      } else {
        setSelectedOrder(order);
      }
      setShowModal(true);
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
      setSelectedOrder(order);
      setShowModal(true);
    }
  };

  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    const id = String(order.id || '').toLowerCase();
    const customer = String(order.customerName || order.fullName || '').toLowerCase();
    return id.includes(search) || customer.includes(search);
  });

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'ChoXuLy': return <span style={{ padding: '6px 12px', borderRadius: '15px', backgroundColor: '#e1f5fe', color: '#0288d1', fontWeight: 'bold', fontSize: '12px' }}>Chờ xử lý</span>;
      case 'DaXacNhan': return <span style={{ padding: '6px 12px', borderRadius: '15px', backgroundColor: '#fff3cd', color: '#856404', fontWeight: 'bold', fontSize: '12px' }}>Đã xác nhận</span>;
      case 'DangGiao': return <span style={{ padding: '6px 12px', borderRadius: '15px', backgroundColor: '#cce5ff', color: '#004085', fontWeight: 'bold', fontSize: '12px' }}>Đang giao</span>;
      case 'HoanTat': return <span style={{ padding: '6px 12px', borderRadius: '15px', backgroundColor: '#d4edda', color: '#155724', fontWeight: 'bold', fontSize: '12px' }}>Hoàn tất</span>;
      case 'DaHuy': return <span style={{ padding: '6px 12px', borderRadius: '15px', backgroundColor: '#f8d7da', color: '#721c24', fontWeight: 'bold', fontSize: '12px' }}>Đã hủy</span>;
      default: return <span style={{ padding: '6px 12px', borderRadius: '15px', backgroundColor: '#e2e3e5', color: '#383d41', fontWeight: 'bold', fontSize: '12px' }}>{status}</span>;
    }
  };

  if (loading) return <div style={{ padding: '20px', fontSize: '16px', color: '#666' }}>Đang tải dữ liệu hệ thống...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Quản lý Đơn hàng
      </h2>
      
      <div style={{ marginBottom: '20px', position: 'relative', width: '100%', maxWidth: '400px' }}>
        <input 
          type="text" 
          placeholder="Tìm kiếm theo mã đơn hoặc tên khách..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
        />
        <FaSearch style={{ position: 'absolute', left: '15px', top: '14px', color: '#999' }} />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f8', textAlign: 'left', borderBottom: '2px solid #e1e8ed' }}>
              <th style={{ padding: '15px' }}>Mã Đơn</th>
              <th style={{ padding: '15px' }}>Khách Hàng</th>
              <th style={{ padding: '15px' }}>Ngày đặt</th>
              <th style={{ padding: '15px' }}>Tổng tiền</th>
              <th style={{ padding: '15px' }}>Trạng thái</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => {
                const customer = order.customerName || order.fullName || 'Đang cập nhật...';
                const phone = order.phone || order.phoneNumber || '';
                
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#34495e' }}>{order.id}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#2c3e50' }}>{customer}</div>
                      {phone && <div style={{ fontSize: '12px', color: '#7f8c8d' }}>📞 {phone}</div>}
                    </td>
                    <td style={{ padding: '15px', color: '#555' }}>
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '15px', color: '#e74c3c', fontWeight: 'bold' }}>
                      {order.totalAmount?.toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '15px' }}>
                      {renderStatusBadge(order.status)}
                    </td>
                    
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleViewDetail(order)}
                          title="Xem chi tiết"
                          style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', width: 'fit-content' }}
                        >
                          <FaEye />
                        </button>

                        {order.status === 'ChoXuLy' && (
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            title="Xóa đơn hàng"
                            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', width: 'fit-content' }}
                          >
                            <FaTrashAlt />
                          </button>
                        )}

                        <select 
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)} 
                          value={order.status}
                          disabled={order.status === 'DaHuy'}
                          style={{ 
                            padding: '6px', 
                            borderRadius: '4px', 
                            border: '1px solid #ccc', 
                            outline: 'none', 
                            cursor: order.status === 'DaHuy' ? 'not-allowed' : 'pointer',
                            backgroundColor: order.status === 'DaHuy' ? '#f5f5f5' : 'white',
                            color: order.status === 'DaHuy' ? '#999' : 'inherit'
                          }}
                        >
                          <option value="ChoXuLy">Chờ xử lý</option>
                          <option value="DaXacNhan">Đã xác nhận</option>
                          <option value="DangGiao">Đang giao</option>
                          <option value="HoanTat">Hoàn tất</option>
                          {order.status === 'DaHuy' && <option value="DaHuy">Đã hủy</option>}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
                  Không tìm thấy đơn hàng nào khớp với tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {showModal && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          
          <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '650px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            {/* 
               NÚT X: Ép cứng kiểu hiển thị (display: block), xóa bỏ mọi margin mặc định, 
               và dùng right: 15px để "đóng đinh" nó vào lề phải.
            */}
            <button 
              onClick={() => setShowModal(false)} 
              style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '15px', 
                background: 'none', 
                border: 'none', 
                fontSize: '22px', 
                cursor: 'pointer', 
                color: '#e74c3c', 
                zIndex: 9999, 
                padding: '5px',
                margin: 0,
                width: 'auto',
                height: 'auto',
                display: 'block'
              }}
            >
              <FaTimes />
            </button>

            {/* KHU VỰC TIÊU ĐỀ: Thêm padding-right lớn (60px) để không bao giờ bị đè chữ vào nút X */}
            <div style={{ padding: '20px 60px 20px 25px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '18px', lineHeight: '1.5' }}>
                Chi tiết Đơn hàng: <span style={{ color: '#2980b9' }}>{selectedOrder.id}</span>
              </h3>
            </div>
            
            <div style={{ padding: '25px', maxHeight: '65vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#fdfdfd', border: '1px solid #eee', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#34495e', borderBottom: '2px solid #3498db', display: 'inline-block', paddingBottom: '5px' }}>Thông tin giao hàng</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ fontSize: '14px' }}><b>Khách hàng:</b> {selectedOrder.customerName || selectedOrder.fullName || 'Đang cập nhật'}</div>
                  <div style={{ fontSize: '14px' }}><b>Điện thoại:</b> {selectedOrder.phone || selectedOrder.phoneNumber || 'Đang cập nhật'}</div>
                  <div style={{ fontSize: '14px', lineHeight: '1.5' }}><b>Địa chỉ:</b> {selectedOrder.address || selectedOrder.shippingAddress || 'Đang cập nhật'}</div>
                  <div style={{ fontSize: '14px' }}><b>Ngày đặt:</b> {new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}</div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>Danh sách Sản phẩm</h4>
              <div style={{ borderRadius: '6px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f4f6f8' }}>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Tên Sản phẩm</th>
                      <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>SL</th>
                      <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.orderItems || selectedOrder.items || []).length > 0 ? (
                      (selectedOrder.orderItems || selectedOrder.items).map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '12px 15px', borderBottom: '1px solid #eee' }}>{item.bookTitle || item.productName || 'Sách'}</td>
                          <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.quantity || 1}</td>
                          <td style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                            {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Đơn hàng không có sản phẩm.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '20px 25px', borderTop: '1px solid #eee', textAlign: 'right', backgroundColor: '#f8f9fa' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginRight: '10px' }}>Tổng cộng:</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#e74c3c' }}>{(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;