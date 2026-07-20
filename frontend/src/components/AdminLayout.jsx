import React from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();

  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  };

  const user = getUserInfo();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'block',
    padding: '12px 20px',
    color: 'white',
    textDecoration: 'none',
    backgroundColor: isActive ? '#34495e' : 'transparent',
    borderLeft: isActive ? '4px solid #3498db' : '4px solid transparent',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      
      {/* ================= SIDEBAR ================= */}
      <div style={{ width: '260px', backgroundColor: '#2c3e50', color: 'white', paddingTop: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', letterSpacing: '1px' }}>QUẢN TRỊ VIÊN</h2>
        
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
          <li><NavLink to="/admin" end style={navLinkStyle}>📊 Tổng quan</NavLink></li>
          <li><NavLink to="/admin/books" style={navLinkStyle}>📚 Quản lý Sách</NavLink></li>
          <li><NavLink to="/admin/orders" style={navLinkStyle}>📦 Quản lý Đơn hàng</NavLink></li>
          <li><NavLink to="/admin/users" style={navLinkStyle}>👥 Quản lý Người dùng</NavLink></li>
        </ul>
      </div>

      {/* ================= NỘI DUNG CHÍNH ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* ================= THANH HEADER BÊN TRÊN ================= */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px 30px', 
          display: 'flex', 
          justifyContent: 'flex-end', // Ép toàn bộ nội dung sang góc phải
          alignItems: 'center', 
          gap: '25px', // Tạo khoảng cách đều đặn giữa các nút
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          borderBottom: '1px solid #e0e0e0'
        }}>
          
          {/* Nút Quay lại trang chủ */}
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: '#3498db', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            🏠 Về trang chủ
          </Link>

          {/* Vạch ngăn cách */}
          <span style={{ color: '#ccc' }}>|</span>

          {/* Lời chào */}
          <span style={{ fontSize: '15px', color: '#555' }}>
            Xin chào, <strong style={{ color: '#2c3e50' }}>{user?.fullName || 'Admin'}</strong>
          </span>

          {/* Nút Đăng xuất */}
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: '8px 20px', 
              cursor: 'pointer', 
              backgroundColor: '#e74c3c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: 'bold',
              width: 'auto', // Đảm bảo nút không bị kéo giãn dài ngoằng
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            Đăng xuất
          </button>
        </div>

        {/* Nơi hiển thị các trang con */}
        <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
          <Outlet /> 
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;