import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBook, 
  FaListAlt, 
  FaShoppingCart, 
  FaUsers, 
  FaChartBar, 
  FaSignOutAlt, 
  FaHome,
  FaWarehouse,
  FaTruck, // Đã thêm icon xe tải cho Nhà cung cấp
  FaBars,
  FaTimes
} from 'react-icons/fa';

// NHÚNG COMPONENT CHUÔNG THÔNG BÁO VÀO ĐÂY
// (Lưu ý: Bạn nhớ kiểm tra lại đường dẫn './NotificationBell' cho khớp với thư mục thực tế của bạn nhé)
import NotificationBell from './NotificationBell'; 

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Điều khiển đóng/mở sidebar trên tablet & điện thoại
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tự động đóng sidebar mỗi khi chuyển trang (trên mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: isActive(path) ? '#ffffff' : '#b0c4de',
    textDecoration: 'none',
    backgroundColor: isActive(path) ? '#1abc9c' : 'transparent',
    borderRadius: '4px',
    margin: '4px 10px',
    fontWeight: '500',
    transition: '0.2s'
  });

  return (
    <div className="admin-shell" style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8f9fa', fontFamily: 'inherit', overflow: 'hidden' }}>
      <style>{`
        @media (max-width: 992px) {
          .admin-shell .admin-sidebar {
            position: fixed; top: 0; left: 0; bottom: 0; z-index: 1200;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .admin-shell .admin-sidebar.open { transform: translateX(0); }
          .admin-shell .admin-overlay {
            display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1100;
          }
          .admin-shell .admin-overlay.show { display: block; }
          .admin-shell .admin-hamburger { display: flex !important; }
        }
        @media (max-width: 576px) {
          .admin-shell .admin-topbar-title { display: none; }
        }
      `}</style>

      {/* Lớp phủ mờ khi mở sidebar trên mobile/tablet */}
      <div className={`admin-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* ================= SIDEBAR BÊN TRÁI ================= */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ width: '260px', minWidth: '260px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', height: '100vh' }}>
        
        {/* LOGO / TIÊU ĐỀ ADMIN */}
        <div style={{ padding: '20px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#1a252f', textAlign: 'center', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>QUẢN TRỊ VIÊN</span>
          <button
            className="admin-hamburger"
            onClick={() => setIsSidebarOpen(false)}
            style={{ display: 'none', background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: 0 }}
            aria-label="Đóng menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* DANH SÁCH MENU ĐIỀU HƯỚNG */}
        <div style={{ flex: 1, paddingTop: '15px', overflowY: 'auto' }}>
          
          <div style={{ padding: '10px 20px', fontSize: '11px', color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Tổng quan
          </div>

          <Link to="/admin" style={linkStyle('/admin')}>
            <FaTachometerAlt /> Dashboard
          </Link>

          <div style={{ padding: '15px 20px 10px 20px', fontSize: '11px', color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Quản lý Cửa hàng
          </div>
          
          <Link to="/admin/books" style={linkStyle('/admin/books')}>
            <FaBook /> Quản lý Sách
          </Link>

          <Link to="/admin/categories" style={linkStyle('/admin/categories')}>
            <FaListAlt /> Quản lý Danh mục
          </Link>

          {/* ĐÃ THÊM MỤC: QUẢN LÝ NHÀ CUNG CẤP */}
          <Link to="/admin/suppliers" style={linkStyle('/admin/suppliers')}>
            <FaTruck /> Quản lý Nhà cung cấp
          </Link>

          {/* MỤC MỚI: QUẢN LÝ NHẬP KHO */}
          <Link to="/admin/imports" style={linkStyle('/admin/imports')}>
            <FaWarehouse /> Quản lý Nhập kho
          </Link>

          <Link to="/admin/orders" style={linkStyle('/admin/orders')}>
            <FaShoppingCart /> Quản lý Đơn hàng
          </Link>

          <Link to="/admin/users" style={linkStyle('/admin/users')}>
            <FaUsers /> Quản lý Người dùng
          </Link>

          <div style={{ padding: '15px 20px 10px 20px', fontSize: '11px', color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Thống kê
          </div>

          <Link to="/admin/reports" style={linkStyle('/admin/reports')}>
            <FaChartBar /> Báo cáo doanh thu
          </Link>

        </div>

        {/* FOOTER SIDEBAR */}
        <div style={{ padding: '15px', backgroundColor: '#1a252f', textAlign: 'center', fontSize: '12px', color: '#95a5a6' }}>
          Bookstore Admin v1.0
        </div>
      </div>

      {/* ================= NỘI DUNG CHÍNH BÊN PHẢI ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        
        {/* HEADER PHÍA TRÊN */}
        <div style={{ height: '60px', minHeight: '60px', backgroundColor: 'white', borderBottom: '1px solid #e1e8ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px 0 15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#555', fontSize: '14px', minWidth: 0 }}>
            <button
              className="admin-hamburger"
              onClick={() => setIsSidebarOpen(true)}
              style={{ display: 'none', alignItems: 'center', justifyContent: 'center', background: '#2c3e50', color: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
              aria-label="Mở menu"
            >
              <FaBars />
            </button>
            <Link to="/" className="admin-topbar-title" style={{ textDecoration: 'none', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              <FaHome /> Về trang chủ
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            
            {/* COMPONENT CHUÔNG ĐƯỢC CHÈN VÀO ĐÂY */}
            <NotificationBell />

            <span className="admin-topbar-title" style={{ fontSize: '14px', color: '#333', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Xin chào, <b>Quản Trị Viên</b>
            </span>
            <button 
              onClick={handleLogout}
              style={{ 
                backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', 
                borderRadius: '4px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </div>

        {/* KHUNG HIỂN THỊ NỘI DUNG ĐỘNG */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}