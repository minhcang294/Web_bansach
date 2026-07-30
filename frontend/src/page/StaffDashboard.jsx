import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBoxOpen, FaTruck, FaCheckCircle, FaExclamationTriangle, 
  FaSearch, FaFilter, FaEye, FaCheck, FaTimes, 
  FaHome, FaClipboardList, FaBox, FaUsers, FaSignOutAlt, FaBell,
  FaPrint, FaChevronLeft, FaChevronRight, FaClipboardCheck, FaArrowRight
} from 'react-icons/fa';

// ĐIỀN ĐƯỜNG DẪN API BACKEND CỦA BẠN VÀO ĐÂY (Sửa lại port nếu khác)
const API_BASE_URL = 'http://localhost:5000/api'; 

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('orders'); 
  
  // STATES QUẢN LÝ DỮ LIỆU TỪ API
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    shippingOrders: 0,
    completedToday: 0,
    lowStockBooks: 0
  });
  const [loading, setLoading] = useState(false);

  // STATES TÌM KIẾM & BỘ LỌC
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  
  // STATES MODAL CHI TIẾT
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 1. LẤY TOKEN ĐỂ CHỨNG THỰC
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 2. HÀM TẢI DỮ LIỆU TỪ BACKEND
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 2.1 Lấy thống kê KPI
      const statRes = await fetch(`${API_BASE_URL}/orders/staff-stats`, { headers: getAuthHeaders() });
      if (statRes.ok) {
        const statData = await statRes.json();
        setStats(statData);
      }

      // 2.2 Lấy danh sách đơn hàng có bộ lọc
      let url = `${API_BASE_URL}/orders/recent?`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      if (statusFilter && statusFilter !== 'Tất cả') url += `status=${encodeURIComponent(statusFilter)}`;

      const orderRes = await fetch(url, { headers: getAuthHeaders() });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        const formattedOrders = orderData.map(o => ({
          id: o.id,
          name: o.customerName,
          phone: o.phone,
          item: o.itemSummary,
          total: o.total,
          status: o.status,
          statusColor: getStatusColor(o.status),
          date: new Date(o.orderDate).toLocaleDateString('vi-VN')
        }));
        setOrders(formattedOrders);
      } else if (orderRes.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        handleLogout();
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
    setLoading(false);
  };

  // Tự động load dữ liệu khi vào trang hoặc đổi tab
  useEffect(() => {
    if (activeMenu === 'orders' || activeMenu === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeMenu]);

  // 3. HÀM CẬP NHẬT TRẠNG THÁI
  const updateOrderStatus = async (id, newStatus) => {
    if (!window.confirm(`Bạn có chắc muốn chuyển đơn ${id} sang trạng thái: ${newStatus}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchDashboardData(); 
      } else {
        const err = await res.json();
        alert("Lỗi cập nhật: " + err.message);
      }
    } catch (error) {
      alert("Lỗi kết nối tới máy chủ.");
    }
  };

  const handleApprove = (id) => updateOrderStatus(id, 'Đang giao');
  const handleComplete = (id) => updateOrderStatus(id, 'Hoàn tất');
  const handleCancel = (id) => updateOrderStatus(id, 'Đã hủy');

  // 4. HÀM XEM CHI TIẾT ĐƠN HÀNG
  const handleView = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const fullOrder = await res.json();
        fullOrder.statusColor = getStatusColor(fullOrder.status);
        fullOrder.customerName = fullOrder.shippingAddress.split(',')[0]; 
        setSelectedOrder(fullOrder);
        setIsModalOpen(true);
      }
    } catch (error) {
      alert("Không thể tải chi tiết đơn hàng.");
    }
  };

  // 🌟 HÀM IN VẬN ĐƠN CHUẨN XÁC, ĐẦY ĐỦ THÔNG TIN
  const handlePrint = (id) => {
    window.print();
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Inter, Arial, sans-serif' }}>
      
      {/* ================= CSS CHUYÊN DỤNG ĐỂ IN HÓA ĐƠN KHỔ DỌC CHUẨN XÁC (ĐÃ KHẮC PHỤC LỖI TRẮNG/KHUYẾT TRANG) ================= */}
      <style>{`
        @media print {
          @page {
            size: portrait;
            margin: 10mm;
          }
          body, html {
            background: white !important;
            height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* ================= SIDEBAR ================= */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', zIndex: 20 }}>
        <div style={{ padding: '20px 25px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid #334155', color: '#e74c3c' }}>
          Book<span style={{color: 'white'}}>Galaxy</span>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal', marginTop: '5px', letterSpacing: '1px' }}>STAFF PORTAL</div>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <SidebarItem icon={<FaHome />} label="Tổng quan" active={activeMenu === 'dashboard'} onClick={() => setActiveMenu('dashboard')} />
          <SidebarItem icon={<FaClipboardList />} label="Quản lý Đơn hàng" active={activeMenu === 'orders'} onClick={() => setActiveMenu('orders')} badge={stats.pendingOrders.toString()} />
          <SidebarItem icon={<FaBox />} label="Sản phẩm & Kho" active={activeMenu === 'inventory'} onClick={() => setActiveMenu('inventory')} />
          <SidebarItem icon={<FaUsers />} label="Khách hàng" active={activeMenu === 'customers'} onClick={() => setActiveMenu('customers')} />
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #334155' }}>
          <SidebarItem icon={<FaSignOutAlt />} label="Đăng xuất" color="#ef4444" onClick={handleLogout} />
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* TOPBAR */}
        <header style={{ height: '75px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', zIndex: 10, flexShrink: 0 }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>Bảng Điều Khiển Nhân Viên</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%' }}>
              <FaBell size={18} color="#475569" />
              <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '8px', height: '8px' }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #e2e8f0', paddingLeft: '25px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#0284c7', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>NV</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Nhân Viên Bán Hàng</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Ca sáng</div>
              </div>
            </div>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH (CÓ SCROLL) */}
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          {/* ================= GIAO DIỆN TỔNG QUAN (DASHBOARD) ================= */}
          {activeMenu === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', animation: 'fadeIn 0.3s ease' }}>
              
              {/* THẺ KPI THỐNG KÊ */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <StatCard icon={<FaBoxOpen />} title="Đơn Chờ Xử Lý" value={stats.pendingOrders} color="#d97706" bg="#fef3c7" />
                <StatCard icon={<FaTruck />} title="Đơn Đang Giao" value={stats.shippingOrders} color="#0284c7" bg="#e0f2fe" />
                <StatCard icon={<FaCheckCircle />} title="Hoàn Tất (Hôm nay)" value={stats.completedToday} color="#16a34a" bg="#dcfce7" />
                <StatCard icon={<FaExclamationTriangle />} title="Sách Sắp Hết Kho" value={stats.lowStockBooks} color="#dc2626" bg="#fee2e2" />
              </div>

              {/* BẢNG RÚT GỌN (5 ĐƠN MỚI NHẤT) */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                    <FaClipboardList color="#0284c7" /> Đơn Hàng Gần Đây {loading && <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>(Đang tải...)</span>}
                  </h3>
                  <button onClick={() => setActiveMenu('orders')} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'transparent', border: 'none', color: '#0284c7', fontWeight: '600', cursor: 'pointer' }}>
                    Xem tất cả <FaArrowRight size={12} />
                  </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                    <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '16px 25px' }}>Mã ĐH</th>
                        <th style={{ padding: '16px 25px' }}>Khách hàng</th>
                        <th style={{ padding: '16px 25px' }}>Sản phẩm</th>
                        <th style={{ padding: '16px 25px' }}>Tổng tiền</th>
                        <th style={{ padding: '16px 25px', textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ padding: '16px 25px', textAlign: 'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px', color: '#334155' }}>
                      {orders.length === 0 && !loading && (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Không có đơn hàng nào gần đây.</td></tr>
                      )}
                      {orders.slice(0, 5).map((order, idx) => (
                        <TableRow 
                          key={idx} {...order} 
                          total={formatCurrency(order.total)}
                          onApprove={() => handleApprove(order.id)} 
                          onComplete={() => handleComplete(order.id)}
                          onCancel={() => handleCancel(order.id)}
                          onView={() => handleView(order.id)}
                          onPrint={() => handlePrint(order.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= GIAO DIỆN QUẢN LÝ ĐƠN HÀNG CHI TIẾT (ORDERS) ================= */}
          {activeMenu === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', animation: 'fadeIn 0.3s ease' }}>
              
              {/* THANH CÔNG CỤ & BỘ LỌC ĐẦY ĐỦ */}
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '300px' }}>
                    <FaSearch style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '14px', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Tìm mã đơn hàng, số điện thoại..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchDashboardData()}
                      style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontSize: '14px', color: '#1e293b' }} 
                    />
                  </div>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer', fontSize: '14px', color: '#1e293b', backgroundColor: '#fff' }}
                  >
                    <option value="Tất cả">Tất cả trạng thái</option>
                    <option value="Chờ xử lý">Chờ xử lý</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Hoàn tất">Hoàn tất</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                  <button onClick={fetchDashboardData} style={{ padding: '10px 20px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <FaFilter /> Lọc dữ liệu
                  </button>
                </div>
                <button style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px' }}>
                  <FaPrint /> Xuất Excel
                </button>
              </div>

              {/* BẢNG DANH SÁCH TOÀN BỘ ĐƠN HÀNG */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 25px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                    <FaClipboardList color="#0284c7" /> Toàn bộ Đơn Hàng {loading && <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>(Đang tải...)</span>}
                  </h3>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                    <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '16px 25px' }}>Mã ĐH</th>
                        <th style={{ padding: '16px 25px' }}>Khách hàng</th>
                        <th style={{ padding: '16px 25px' }}>Sản phẩm</th>
                        <th style={{ padding: '16px 25px' }}>Tổng tiền</th>
                        <th style={{ padding: '16px 25px', textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ padding: '16px 25px', textAlign: 'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px', color: '#334155' }}>
                      {orders.length === 0 && !loading && (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</td></tr>
                      )}
                      {orders.map((order, idx) => (
                        <TableRow 
                          key={idx} {...order} 
                          total={formatCurrency(order.total)}
                          onApprove={() => handleApprove(order.id)} 
                          onComplete={() => handleComplete(order.id)}
                          onCancel={() => handleCancel(order.id)}
                          onView={() => handleView(order.id)} 
                          onPrint={() => handlePrint(order.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'inventory' && <div><h3 style={{color: '#475569'}}>Khu vực Sản phẩm & Kho đang được phát triển...</h3></div>}
          {activeMenu === 'customers' && <div><h3 style={{color: '#475569'}}>Khu vực Khách hàng đang được phát triển...</h3></div>}

        </main>
      </div>

      {/* ================= MODAL XEM CHI TIẾT ĐƠN HÀNG THỰC TẾ ================= */}
      {isModalOpen && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', width: '650px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'fadeIn 0.2s ease', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* 🌟 DẤU X MÀU ĐỎ NẰM SÁT GÓC TRÊN CÙNG BÊN PHẢI CỦA MODAL */}
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '16px 20px', zIndex: 10000, display: 'flex', justifyContent: 'flex-end', width: '100%', pointerEvents: 'none' }}>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ 
                  pointerEvents: 'auto',
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%',
                  width: '34px', height: '34px',
                  fontSize: '16px', cursor: 'pointer', color: '#ef4444', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
                title="Đóng lại"
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '20px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', paddingRight: '60px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                Chi Tiết Đơn Hàng: <span style={{ color: '#0284c7' }}>{selectedOrder.id}</span>
              </h3>
            </div>
            
            {/* 🌟 KHUNG NỘI DUNG ĐẦY ĐỦ THÔNG TIN ĐỂ IN VẬN ĐƠN */}
            <div id="printable-invoice" style={{ padding: '30px', overflowY: 'auto', backgroundColor: '#fff' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #2c3e50', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '22px' }}>BOOK GALAXY STORE</h2>
                <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#666' }}>Phiếu giao hàng / Hóa đơn bán lẻ</p>
                <h3 style={{ margin: '15px 0 0', color: '#0284c7', fontSize: '18px' }}>Mã đơn: {selectedOrder.id}</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', fontSize: '14px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>Địa chỉ giao hàng:</p>
                  <strong style={{ color: '#0f172a', fontSize: '15px' }}>{selectedOrder.shippingAddress}</strong>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>Số điện thoại:</p>
                  <strong style={{ color: '#0f172a', fontSize: '15px' }}>{selectedOrder.phoneNumber}</strong>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>Trạng thái hiện tại:</p>
                  <span style={{ backgroundColor: `${selectedOrder.statusColor}20`, color: selectedOrder.statusColor, padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '15px' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>Danh sách sản phẩm:</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Tên Sách</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #cbd5e1' }}>SL</th>
                      <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #cbd5e1' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px', color: '#334155' }}>{item.bookTitle}</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#334155' }}>{item.quantity}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ textAlign: 'right', borderTop: '2px dashed #cbd5e1', paddingTop: '15px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginRight: '15px' }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#e11d48' }}>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '18px 25px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>Đóng lại</button>
              {(selectedOrder.status === 'Chờ xử lý' || selectedOrder.status === 'Hoàn tất' || selectedOrder.status === 'Đang giao') && (
                <button onClick={() => handlePrint(selectedOrder.id)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0284c7', cursor: 'pointer', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaPrint/> In vận đơn
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Các Component Con hỗ trợ UI ---
const getStatusColor = (status) => {
  switch (status) {
      case 'Chờ xử lý': return '#f59e0b';
      case 'Đang giao': return '#3b82f6';
      case 'Hoàn tất': return '#10b981';
      case 'Đã hủy': return '#ef4444';
      default: return '#64748b';
  }
};

const SidebarItem = ({ icon, label, active, onClick, color, badge }) => (
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', padding: '16px 25px', cursor: 'pointer',
      backgroundColor: active ? '#334155' : 'transparent',
      color: color || (active ? '#fff' : '#94a3b8'),
      borderLeft: active ? '4px solid #38bdf8' : '4px solid transparent',
      transition: 'all 0.2s ease'
    }}
  >
    <span style={{ fontSize: '18px', marginRight: '15px' }}>{icon}</span>
    <span style={{ flex: 1, fontSize: '15px', fontWeight: active ? '600' : '400' }}>{label}</span>
    {badge && badge !== "0" && <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '20px', fontWeight: 'bold' }}>{badge}</span>}
  </div>
);

const StatCard = ({ icon, title, value, color, bg }) => (
  <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: bg, color: color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
      {icon}
    </div>
    <div>
      <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{value}</div>
    </div>
  </div>
);

// CSS RIÊNG CHO NÚT THAO TÁC
const iconBtn = { 
  width: '32px', 
  height: '32px', 
  border: 'none', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  color: 'white', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  fontSize: '14px',
  transition: 'transform 0.1s, opacity 0.2s',
};

const TableRow = ({ id, name, phone, item, total, status, statusColor, onApprove, onComplete, onCancel, onView, onPrint }) => (
  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
    <td style={{ padding: '16px 25px', fontWeight: '700', color: '#0284c7' }}>{id}</td>
    <td style={{ padding: '16px 25px' }}>
      <div style={{ fontWeight: '600', color: '#1e293b' }}>{name}</div>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{phone}</div>
    </td>
    <td style={{ padding: '16px 25px', color: '#475569' }}>{item}</td>
    <td style={{ padding: '16px 25px', fontWeight: '700', color: '#e11d48' }}>{total}</td>
    <td style={{ padding: '16px 25px', textAlign: 'center' }}>
      <span style={{ backgroundColor: `${statusColor}20`, color: statusColor, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'inline-block', minWidth: '75px', textAlign: 'center' }}>
        {status}
      </span>
    </td>
    <td style={{ padding: '16px 25px' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {status === 'Chờ xử lý' && (
          <>
            <button title="Duyệt đơn" onClick={onApprove} style={{ ...iconBtn, backgroundColor: '#0ea5e9' }}><FaCheck /></button>
            <button title="Hủy đơn" onClick={onCancel} style={{ ...iconBtn, backgroundColor: '#ef4444' }}><FaTimes /></button>
          </>
        )}
        {status === 'Đang giao' && (
          <button title="Xác nhận giao xong" onClick={onComplete} style={{ ...iconBtn, backgroundColor: '#10b981' }}><FaClipboardCheck size={16} /></button>
        )}
        {status === 'Hoàn tất' && (
          <button title="In hóa đơn" onClick={onPrint} style={{ ...iconBtn, backgroundColor: '#8b5cf6' }}><FaPrint /></button>
        )}
        <button title="Xem chi tiết" onClick={onView} style={{ ...iconBtn, backgroundColor: '#64748b' }}><FaEye /></button>
      </div>
    </td>
  </tr>
);

export default StaffDashboard;