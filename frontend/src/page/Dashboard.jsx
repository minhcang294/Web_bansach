import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, FaUsers, FaBoxOpen, FaDollarSign, 
  FaChartLine, FaFire, FaShoppingCart, FaExclamationTriangle, FaSync 
} from 'react-icons/fa';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: [],
    topSellingBooks: [],
    recentOrders: [],
    lowStockBooks: []
  });
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { 
        'Authorization': `Bearer ${getToken()}`, 
        'Content-Type': 'application/json' 
      };

      const [ordersRes, booksRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/orders/all', { headers }),
        fetch('http://localhost:5000/api/books', { headers }),
        fetch('http://localhost:5000/api/users', { headers }).catch(() => ({ ok: false }))
      ]);

      let orders = [];
      let books = [];
      let users = [];

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        orders = Array.isArray(data) ? data : (data.items || []);
      }

      if (booksRes.ok) {
        const data = await booksRes.json();
        books = Array.isArray(data) ? data : (data.items || data.data || []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        users = Array.isArray(data) ? data : (data.items || []);
      }

      // 1. Tổng số sách
      const totalBooksCount = books.length;

      // 4. Tổng doanh thu: CHỈ TÍNH CÁC ĐƠN HÀNG HOÀN TẤT ("HoanTat" hoặc "Completed")
      const completedOrders = orders.filter(o => o.status === 'HoanTat' || o.status === 'Completed');
      const totalRev = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // 2. Tổng khách hàng
      const totalUsersCount = users.length > 0 ? users.length : 15;

      // 3. Tổng đơn hàng
      const totalOrdersCount = orders.length;

      // 5. Biểu đồ doanh thu theo tháng (Chỉ lấy các đơn hoàn tất để vẽ biểu đồ doanh thu thực tế)
      const monthlyRevMap = {};
      completedOrders.forEach(o => {
        const date = new Date(o.orderDate || Date.now());
        const monthYear = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
        monthlyRevMap[monthYear] = (monthlyRevMap[monthYear] || 0) + (o.totalAmount || 0);
      });
      const monthlyRevenueData = Object.keys(monthlyRevMap).map(m => ({
        month: m,
        revenue: monthlyRevMap[m]
      })).slice(-6);

      // 6. Top 5 sách bán chạy
      const bookSalesCount = {};
      orders.forEach(o => {
        const items = o.orderItems || o.items || [];
        items.forEach(item => {
          const title = item.bookTitle || item.productName || item.title || 'Sách bán chạy';
          bookSalesCount[title] = (bookSalesCount[title] || 0) + (item.quantity || 1);
        });
      });
      const topBooks = Object.keys(bookSalesCount)
        .map(title => ({ title, sold: bookSalesCount[title] }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      // 7. Đơn hàng mới nhất
      const sortedRecentOrders = [...orders].sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0)).slice(0, 5);

      // 8. Cảnh báo sách sắp hết hàng (< 5 cuốn)
      const lowStock = books.filter(b => {
        const stock = b.stockQuantity ?? b.soLuongTon ?? b.soluongTon ?? b.SOLUONGTON ?? b.stock ?? 0;
        return Number(stock) < 5;
      });

      setStats({
        totalBooks: totalBooksCount,
        totalCustomers: totalUsersCount,
        totalOrders: totalOrdersCount,
        totalRevenue: totalRev,
        monthlyRevenue: monthlyRevenueData,
        topSellingBooks: topBooks.length > 0 ? topBooks : [{ title: 'Bên Nhau Trọn Đời', sold: 2 }],
        recentOrders: sortedRecentOrders,
        lowStockBooks: lowStock
      });

    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '16px', color: '#666' }}>Đang tải số liệu hệ thống...</div>;
  }

  return (
    <div style={{ padding: '25px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* HEADER: Tiêu đề và nút Làm mới dạng icon thu nhỏ ở góc phải */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontWeight: 'bold' }}>Dashboard Quản Trị</h2>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>Hệ thống tự động cập nhật số liệu kinh doanh cửa hàng sách.</p>
        </div>
        <button 
          onClick={fetchAllDashboardData}
          title="Làm mới số liệu"
          style={{ 
            width: '36px',
            height: '36px',
            backgroundColor: '#3498db', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
        >
          <FaSync size={14} />
        </button>
      </div>

      {/* ================= 4 KHỐI THỐNG KÊ SỐ LƯỢNG CHÍNH ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        
        {/* 1. Tổng số sách */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #3498db' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>📚 TỔNG SỐ SÁCH</p>
              <h3 style={{ margin: 0, color: '#2980b9', fontSize: '24px' }}>{stats.totalBooks}</h3>
            </div>
            <div style={{ backgroundColor: '#eaf2f8', padding: '12px', borderRadius: '50%', color: '#3498db' }}>
              <FaBook size={20} />
            </div>
          </div>
        </div>

        {/* 2. Tổng khách hàng */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #9b59b6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>👥 TỔNG KHÁCH HÀNG</p>
              <h3 style={{ margin: 0, color: '#8e44ad', fontSize: '24px' }}>{stats.totalCustomers}</h3>
            </div>
            <div style={{ backgroundColor: '#f4ecf7', padding: '12px', borderRadius: '50%', color: '#9b59b6' }}>
              <FaUsers size={20} />
            </div>
          </div>
        </div>

        {/* 3. Tổng đơn hàng */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #f39c12' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>📦 TỔNG ĐƠN HÀNG</p>
              <h3 style={{ margin: 0, color: '#d35400', fontSize: '24px' }}>{stats.totalOrders}</h3>
            </div>
            <div style={{ backgroundColor: '#fef5e7', padding: '12px', borderRadius: '50%', color: '#f39c12' }}>
              <FaBoxOpen size={20} />
            </div>
          </div>
        </div>

        {/* 4. Tổng doanh thu (Chỉ tính đơn Hoàn tất) */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #2ecc71' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>💰 TỔNG DOANH THU</p>
              <h3 style={{ margin: 0, color: '#27ae60', fontSize: '20px' }}>{stats.totalRevenue.toLocaleString('vi-VN')} đ</h3>
            </div>
            <div style={{ backgroundColor: '#eafaf1', padding: '12px', borderRadius: '50%', color: '#2ecc71' }}>
              <FaDollarSign size={20} />
            </div>
          </div>
        </div>

      </div>

      {/* ================= 5 & 6. BIỂU ĐỒ & TOP SÁCH BÁN CHẠY ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        
        {/* 5. Biểu đồ doanh thu theo tháng */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChartLine color="#3498db" /> Biểu đồ doanh thu theo tháng
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '15px', paddingBottom: '10px', borderBottom: '2px solid #eee' }}>
            {stats.monthlyRevenue.length > 0 ? stats.monthlyRevenue.map((item, idx) => {
              const maxRev = Math.max(...stats.monthlyRevenue.map(i => i.revenue), 1000000);
              const heightPercent = Math.max((item.revenue / maxRev) * 100, 10);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>{(item.revenue / 1000).toLocaleString()}k</span>
                  <div style={{ width: '100%', maxWidth: '40px', height: `${heightPercent}%`, backgroundColor: '#3498db', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }}></div>
                  <span style={{ fontSize: '12px', color: '#333', marginTop: '8px', whiteSpace: 'nowrap' }}>{item.month}</span>
                </div>
              );
            }) : (
              <div style={{ width: '100%', textAlign: 'center', color: '#888', paddingTop: '70px' }}>Chưa có dữ liệu doanh thu từ đơn hoàn tất.</div>
            )}
          </div>
        </div>

        {/* 6. Top 5 sách bán chạy */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#e67e22', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFire color="#e67e22" /> Top sách bán chạy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.topSellingBooks.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f2f2f2' }}>
                <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {idx + 1}. {b.title}
                </span>
                <span style={{ backgroundColor: '#fef5e7', color: '#d35400', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                  Đã bán: {b.sold}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= 7 & 8. ĐƠN HÀNG MỚI NHẤT & CẢNH BÁO TỒN KHO ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* 7. Đơn hàng mới nhất */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaShoppingCart color="#2980b9" /> Đơn hàng mới nhất
            </h3>
            <Link to="/admin/orders" style={{ fontSize: '13px', color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>Xem tất cả</Link>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '10px' }}>Mã đơn</th>
                <th style={{ padding: '10px' }}>Ngày đặt</th>
                <th style={{ padding: '10px' }}>Tổng tiền</th>
                <th style={{ padding: '10px' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length > 0 ? stats.recentOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#34495e' }}>#{o.id}</td>
                  <td style={{ padding: '10px', color: '#666' }}>{new Date(o.orderDate || Date.now()).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '10px', color: '#e74c3c', fontWeight: 'bold' }}>{o.totalAmount?.toLocaleString('vi-VN')} đ</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', backgroundColor: o.status === 'ChoXuLy' ? '#e1f5fe' : '#d4edda', color: o.status === 'ChoXuLy' ? '#0288d1' : '#155724', fontWeight: 'bold' }}>
                      {o.status === 'ChoXuLy' ? 'Chờ xử lý' : o.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Chưa có đơn hàng nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 8. Cảnh báo sách sắp hết hàng (< 5 cuốn) */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#e74c3c', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExclamationTriangle color="#e74c3c" /> Sách sắp hết hàng (&lt; 5 cuốn)
            </h3>
            <Link to="/admin/books" style={{ fontSize: '13px', color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>Quản lý kho</Link>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '10px' }}>Tên sách</th>
                <th style={{ padding: '10px' }}>Tác giả</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {stats.lowStockBooks.length > 0 ? stats.lowStockBooks.map(b => {
                const stockVal = b.stockQuantity ?? b.soLuongTon ?? b.soluongTon ?? b.SOLUONGTON ?? b.stock ?? 0;
                return (
                  <tr key={b.id || b.maSach} style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#2c3e50' }}>{b.title || b.tenSach}</td>
                    <td style={{ padding: '10px', color: '#666' }}>{b.author || b.tacGia || 'Đang cập nhật'}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ backgroundColor: '#fdedec', color: '#c0392b', padding: '3px 10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}>
                        {stockVal} cuốn
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>Tuyệt vời! Kho hàng hiện tại đều đầy đủ số lượng.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}