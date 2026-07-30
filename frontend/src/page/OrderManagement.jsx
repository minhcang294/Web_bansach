import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaTimes, FaTrashAlt } from 'react-icons/fa';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  // HÀM XỬ LÝ CHUYỂN ĐỔI MÚI GIỜ UTC SANG GIỜ VIỆT NAM (UTC+7)
  const formatOrderDate = (dateString) => {
    if (!dateString) return 'Đang cập nhật...';
    const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const dateObj = new Date(utcDateString);
    
    if (isNaN(dateObj.getTime())) return new Date(dateString).toLocaleString('vi-VN');

    const time = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} ${date}`;
  };

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
        const errData = await response.json().catch(() => ({}));
        alert(`Cập nhật thất bại! ${errData.message || ''}`);
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

  // HÀM IN HÓA ĐƠN TÁCH BIỆT (HIỂN THỊ ĐỦ 100% NỘI DUNG KHI IN)
  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice').innerHTML;
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    
    printWindow.document.write('<html><head><title>Hóa đơn bán hàng - Book Galaxy</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
      h2 { color: #2c3e50; text-align: center; margin-bottom: 5px; }
      h3 { color: #2980b9; text-align: center; margin-top: 5px; }
      p { margin: 5px 0; font-size: 13px; color: #666; text-align: center; }
      div { margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      th { background-color: #f4f6f8; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    const id = String(order.id || '').toLowerCase();
    const customer = String(order.customerName || order.CustomerName || order.fullName || '').toLowerCase();
    return id.includes(search) || customer.includes(search);
  });

  const renderStatusBadge = (status) => {
    const cleanStatus = status ? status.trim() : '';
    const badgeStyle = { 
      padding: '6px 14px', 
      borderRadius: '15px', 
      fontWeight: 'bold', 
      fontSize: '12px',
      display: 'inline-block',
      whiteSpace: 'nowrap'
    };

    switch(cleanStatus) {
      case 'ChoXuLy': 
      case 'Chờ xử lý':
        return <span style={{ ...badgeStyle, backgroundColor: '#e1f5fe', color: '#0288d1' }}>Chờ xử lý</span>;
      case 'DaXacNhan': 
      case 'Đã xác nhận':
        return <span style={{ ...badgeStyle, backgroundColor: '#fff3cd', color: '#856404' }}>Đã xác nhận</span>;
      case 'DangGiao': 
      case 'Đang giao':
        return <span style={{ ...badgeStyle, backgroundColor: '#cce5ff', color: '#004085' }}>Đang giao</span>;
      case 'HoanTat': 
      case 'Hoàn tất':
        return <span style={{ ...badgeStyle, backgroundColor: '#d4edda', color: '#155724' }}>Hoàn tất</span>;
      case 'DaHuy': 
      case 'Đã hủy':
        return <span style={{ ...badgeStyle, backgroundColor: '#f8d7da', color: '#721c24' }}>Đã hủy</span>;
      default: 
        return <span style={{ ...badgeStyle, backgroundColor: '#e2e3e5', color: '#383d41' }}>{status}</span>;
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
                const customer = order.customerName || order.CustomerName || order.fullName || 'Đang cập nhật...';
                const phone = order.phone || order.phoneNumber || order.PhoneNumber || '';
                const cleanStatus = order.status ? order.status.trim() : '';
                const isPending = cleanStatus === 'ChoXuLy' || cleanStatus === 'Chờ xử lý';
                const isCancelled = cleanStatus === 'DaHuy' || cleanStatus === 'Đã hủy';
                
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#34495e' }}>{order.id}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#2c3e50' }}>{customer}</div>
                      {phone && <div style={{ fontSize: '12px', color: '#7f8c8d' }}>📞 {phone}</div>}
                    </td>
                    <td style={{ padding: '15px', color: '#555' }}>
                      {formatOrderDate(order.orderDate)}
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

                        {isPending && (
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
                          disabled={isCancelled}
                          style={{ 
                            padding: '6px', 
                            borderRadius: '4px', 
                            border: '1px solid #ccc', 
                            outline: 'none', 
                            cursor: isCancelled ? 'not-allowed' : 'pointer',
                            backgroundColor: isCancelled ? '#f5f5f5' : 'white',
                            color: isCancelled ? '#999' : 'inherit',
                            fontWeight: isCancelled ? 'bold' : 'normal'
                          }}
                        >
                          <option value="Chờ xử lý">Chờ xử lý</option>
                          <option value="Đã xác nhận">Đã xác nhận</option>
                          <option value="Đang giao">Đang giao</option>
                          <option value="Hoàn tất">Hoàn tất</option>
                          <option value="Đã hủy">Đã hủy</option>
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

      {/* MODAL CHI TIẾT ĐƠN HÀNG & IN HÓA ĐƠN */}
      {showModal && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          
          <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '650px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px 15px', zIndex: 10000, display: 'flex', justifyContent: 'flex-end', width: '100%', pointerEvents: 'none' }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ 
                  pointerEvents: 'auto',
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%',
                  width: '32px', height: '32px',
                  fontSize: '15px', cursor: 'pointer', color: '#e74c3c', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
                title="Đóng"
              >
                <FaTimes />
              </button>
            </div>

            {/* KHUNG NỘI DUNG SẼ ĐƯỢC IN (ID: printable-invoice) */}
            <div id="printable-invoice" style={{ padding: '30px', backgroundColor: '#fff', maxHeight: '65vh', overflowY: 'auto' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #2c3e50', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '22px' }}>BOOK GALAXY STORE</h2>
                <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#666' }}>Phiếu giao hàng / Hóa đơn bán lẻ</p>
                <h3 style={{ margin: '15px 0 0', color: '#2980b9', fontSize: '18px' }}>Mã đơn: {selectedOrder.id}</h3>
              </div>

              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#34495e', fontSize: '15px' }}>Thông tin khách hàng</h4>
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                  <div><b>Họ tên:</b> {selectedOrder.customerName || selectedOrder.CustomerName || selectedOrder.fullName || 'Đang cập nhật'}</div>
                  <div><b>Điện thoại:</b> {selectedOrder.phone || selectedOrder.phoneNumber || selectedOrder.PhoneNumber || 'Đang cập nhật'}</div>
                  <div><b>Địa chỉ giao:</b> {selectedOrder.address || selectedOrder.shippingAddress || selectedOrder.ShippingAddress || 'Đang cập nhật'}</div>
                  <div><b>Thanh toán:</b> {selectedOrder.paymentMethod || selectedOrder.PaymentMethod || 'COD'}</div>
                  {(selectedOrder.note || selectedOrder.Note) && <div><b>Ghi chú:</b> {selectedOrder.note || selectedOrder.Note}</div>}
                  <div><b>Ngày đặt hàng:</b> {formatOrderDate(selectedOrder.orderDate)}</div>
                  <div><b>Trạng thái:</b> {selectedOrder.status}</div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 8px 0', color: '#34495e', fontSize: '15px' }}>Chi tiết sản phẩm</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f6f8' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Tên Sách</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>SL</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.orderItems || selectedOrder.items || []).length > 0 ? (
                    (selectedOrder.orderItems || selectedOrder.items).map((item, idx) => {
                      const unitPrice = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
                      const quantity = item.quantity || 1;
                      const lineTotal = unitPrice * quantity;

                      return (
                        <tr key={idx}>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{item.bookTitle || item.productName || 'Sách'}</td>
                          <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{quantity}</td>
                          <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                            {lineTotal.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="3" style={{ padding: '15px', textAlign: 'center', color: '#888' }}>Không có sản phẩm.</td></tr>
                  )}
                </tbody>
              </table>

              <div style={{ textAlign: 'right', borderTop: '2px dashed #ddd', paddingTop: '15px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginRight: '15px' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#e74c3c' }}>{(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
              </div>

            </div>

            {/* THANH CÔNG CỤ DƯỚI MODAL */}
            <div style={{ padding: '15px 25px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f8f9fa' }}>
              <button 
                onClick={handlePrint} 
                style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🖨️ In hóa đơn
              </button>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ backgroundColor: '#7f8c8d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;