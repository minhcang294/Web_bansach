import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, FaUsers, FaBoxOpen, FaDollarSign, 
  FaChartLine, FaFire, FaShoppingCart, FaExclamationTriangle, FaSync, FaHistory,
  FaFilter, FaTimes, 
  FaDatabase, FaDownload, FaUpload 
} from 'react-icons/fa';

// =================================================================
// COMPONENT CON: GIAO DIỆN SAO LƯU & PHỤC HỒI DỮ LIỆU (CÂN ĐỐI TUYỆT ĐỐI)
// =================================================================
function BackupRestoreSection() {
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [backupFiles, setBackupFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  const fetchBackupFiles = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/Backup/files", {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const files = await response.json();
        setBackupFiles(files);
        if (files.length > 0 && !selectedFile) {
          setSelectedFile(files[0]);
        }
      }
    } catch (error) {
      console.error("Không thể tải danh sách file backup");
    }
  };

  useEffect(() => {
    fetchBackupFiles();
  }, []);

  const handleBackup = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn tạo bản sao lưu dữ liệu hiện tại?')) return;
    
    setLoadingAction('backup');
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch("http://localhost:5000/api/Backup/backup", {
        method: "POST",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: `✅ ${data.message} (${data.fileName})`, type: 'success' });
        await fetchBackupFiles(); 
        setSelectedFile(data.fileName); 
      } else {
        setMessage({ text: `❌ ${data.message}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: "❌ Lỗi mất kết nối đến Server.", type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setMessage({ text: "⚠️ Vui lòng chọn một file sao lưu từ danh sách để phục hồi!", type: 'error' });
      return;
    }
    
    if (!window.confirm(`⚠️ NGUY HIỂM: Toàn bộ dữ liệu hiện tại sẽ bị xóa sạch và thay thế bằng file [${selectedFile}]. Bạn có chắc chắn?`)) return;

    setLoadingAction('restore');
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch("http://localhost:5000/api/Backup/restore", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fileName: selectedFile })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ text: `✅ ${data.message}`, type: 'success' });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ text: `❌ ${data.message}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: "❌ Lỗi hệ thống khi phục hồi.", type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: '25px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaDatabase color="#34495e" /> Sao lưu & Phục hồi Hệ thống
      </h3>
      
      {message.text && (
        <div style={{ 
          padding: '10px 15px', marginBottom: '15px', borderRadius: '6px', fontSize: '14px',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#16a34a' : '#dc2626'
        }}>
          {message.text}
        </div>
      )}

      {/* 2 Card chia đều, chiều cao đồng bộ */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        
        {/* Card 1: Sao lưu */}
        <div style={{ flex: '1 1 300px', padding: '18px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '215px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '36px', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#374151', fontWeight: '700' }}>Tạo bản sao lưu mới</h4>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px', lineHeight: '1.5' }}>
              Hệ thống sẽ nén toàn bộ đơn hàng, sách, và người dùng thành một file .bak lưu trên máy chủ.
            </p>
          </div>
          <button 
            onClick={handleBackup} 
            disabled={loadingAction !== null}
            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
            <FaDownload /> {loadingAction === 'backup' ? 'Đang xử lý...' : 'Tiến hành Sao lưu'}
          </button>
        </div>

        {/* Card 2: Phục hồi */}
        <div style={{ flex: '1 1 300px', padding: '18px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '215px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '36px', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#374151', fontWeight: '700', whiteSpace: 'nowrap' }}>
                Phục hồi dữ liệu
              </h4>
              <button 
                onClick={fetchBackupFiles} 
                title="Làm mới danh sách file" 
                style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', border: 'none', 
                  backgroundColor: '#f1f5f9', color: '#2563eb', cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'rotate(180deg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
              >
                <FaSync size={13} />
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px', lineHeight: '1.5' }}>
              Chọn một file sao lưu có sẵn trong hệ thống để phục hồi dữ liệu.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              style={{ flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', outline: 'none' }}
            >
              {backupFiles.length > 0 ? (
                backupFiles.map((file, idx) => (
                  <option key={idx} value={file}>{file}</option>
                ))
              ) : (
                <option value="">-- Không có file .bak nào --</option>
              )}
            </select>

            <button 
              onClick={handleRestore}
              disabled={loadingAction !== null || backupFiles.length === 0}
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', whiteSpace: 'nowrap', width: '130px', justifyContent: 'center' }}>
              <FaUpload /> {loadingAction === 'restore' ? 'Đang xử lý...' : 'Phục hồi'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// =================================================================
// COMPONENT CHÍNH: DASHBOARD
// =================================================================
export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: [],
    topSellingBooks: [],
    recentOrders: [],
    lowStockBooks: [],
    activityLogs: [] 
  });
  const [loading, setLoading] = useState(true);

  // 🌟 KHAI BÁO STATE CHO BỘ LỌC LỊCH SỬ THAO TÁC
  const [logRoleFilter, setLogRoleFilter] = useState('All');

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [rawStore, setRawStore] = useState({ orders: [], books: [], users: [], logs: [] });

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const getOrderTotal = (o) => o.totalAmount ?? o.TotalAmount ?? o.total ?? o.Total ?? o.tongTien ?? o.TongTien ?? 0;
  const getOrderStatus = (o) => o.status ?? o.Status ?? o.trangThai ?? o.TrangThai ?? '';
  const getOrderDate = (o) => o.orderDate ?? o.OrderDate ?? o.ngayDat ?? o.NgayDat ?? Date.now();
  const getOrderId = (o) => o.id ?? o.Id ?? o.maDonHang ?? o.MaDonHang ?? 'N/A';
  const getOrderItems = (o) => o.orderItems ?? o.OrderItems ?? o.items ?? o.Items ?? o.chiTietDonHang ?? o.ChiTietDonHang ?? [];
  
  const getItemTitle = (item) => item.bookTitle ?? item.BookTitle ?? item.productName ?? item.ProductName ?? item.tenSach ?? item.TenSach ?? 'Sách';
  const getItemQty = (item) => item.quantity ?? item.Quantity ?? item.soLuong ?? item.SoLuong ?? 1;

  const getBookTitle = (b) => b.title ?? b.Title ?? b.tenSach ?? b.TenSach ?? 'Sách';
  const getBookAuthor = (b) => b.author ?? b.Author ?? b.tacGia ?? b.TacGia ?? 'Đang cập nhật';
  const getBookStock = (b) => {
    const stock = b.stockQuantity ?? b.StockQuantity ?? b.quantity ?? b.Quantity ?? b.stock ?? b.Stock ?? b.soLuongTon ?? b.SoLuongTon ?? 0;
    return parseInt(stock, 10);
  };

  const fetchWithFallback = async (urls, headers) => {
    for (const url of urls) {
      try {
        const res = await fetch(`http://localhost:5000${url}`, { headers });
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : (data.items || data.data || data.$values || []);
        }
      } catch (error) {}
    }
    return []; 
  };

  const fetchAllDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
      const [orders, books, users, logs] = await Promise.all([
        fetchWithFallback(['/api/orders/all', '/api/orders', '/api/donhang'], headers),
        fetchWithFallback(['/api/books', '/api/sach', '/api/Book'], headers),
        fetchWithFallback(['/api/auth/users', '/api/users', '/api/khachhang'], headers),
        fetchWithFallback(['/api/ActivityLogs', '/api/activitylogs'], headers)
      ]);

      setRawStore({ orders, books, users, logs });
      applyFilterAndCalculate(orders, books, users, logs, dateRange.start, dateRange.end);

    } catch (error) {
      console.error("Lỗi đồng bộ dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilterAndCalculate = (allOrders, allBooks, allUsers, allLogs, startDateStr, endDateStr) => {
    let filteredOrders = allOrders;
    let filteredLogs = allLogs;

    if (startDateStr) {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      filteredOrders = filteredOrders.filter(o => {
        const d = getOrderDate(o);
        const dateObj = new Date(typeof d === 'string' && !d.endsWith('Z') ? `${d}Z` : d);
        return dateObj >= start;
      });
      filteredLogs = filteredLogs.filter(l => new Date(l.timestamp || l.Timestamp) >= start);
    }

    if (endDateStr) {
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      filteredOrders = filteredOrders.filter(o => {
        const d = getOrderDate(o);
        const dateObj = new Date(typeof d === 'string' && !d.endsWith('Z') ? `${d}Z` : d);
        return dateObj <= end;
      });
      filteredLogs = filteredLogs.filter(l => new Date(l.timestamp || l.Timestamp) <= end);
    }

    const totalBooksCount = allBooks.length;
    const customersOnly = allUsers.filter(u => u.role === 'User' || u.Role === 'User' || !u.role);
    const totalUsersCount = customersOnly.length > 0 ? customersOnly.length : allUsers.length;
    const lowStock = allBooks.filter(b => getBookStock(b) < 5);

    const totalOrdersCount = filteredOrders.length;

    const completedStatuses = ['HoanTat', 'Hoàn tất', 'Completed', 'completed', 'DaGiao', 'Đã giao'];
    const completedOrders = filteredOrders.filter(o => completedStatuses.includes(getOrderStatus(o).trim()));
    const totalRev = completedOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);

    const monthlyRevMap = {};
    completedOrders.forEach(o => {
      const dateString = getOrderDate(o);
      const utcDate = typeof dateString === 'string' && !dateString.endsWith('Z') ? `${dateString}Z` : dateString;
      const date = new Date(utcDate);
      if (!isNaN(date.getTime())) {
        const monthYear = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
        monthlyRevMap[monthYear] = (monthlyRevMap[monthYear] || 0) + getOrderTotal(o);
      }
    });
    const monthlyRevenueData = Object.keys(monthlyRevMap).map(m => ({ month: m, revenue: monthlyRevMap[m] })).slice(-6);

    const bookSalesCount = {};
    filteredOrders.forEach(o => {
      getOrderItems(o).forEach(item => {
        const title = getItemTitle(item);
        bookSalesCount[title] = (bookSalesCount[title] || 0) + getItemQty(item);
      });
    });
    const topBooks = Object.keys(bookSalesCount).map(title => ({ title, sold: bookSalesCount[title] })).sort((a, b) => b.sold - a.sold).slice(0, 5);

    const sortedRecentOrders = [...filteredOrders].sort((a, b) => new Date(getOrderDate(b)) - new Date(getOrderDate(a))).slice(0, 5);
    
    // Hiển thị tối đa 20 dòng lịch sử thao tác
    const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.timestamp || b.Timestamp) - new Date(a.timestamp || a.Timestamp)).slice(0, 20);

    setStats({
      totalBooks: totalBooksCount,
      totalCustomers: totalUsersCount,
      totalOrders: totalOrdersCount,
      totalRevenue: totalRev,
      monthlyRevenue: monthlyRevenueData,
      topSellingBooks: topBooks.length > 0 ? topBooks : [],
      recentOrders: sortedRecentOrders,
      lowStockBooks: lowStock,
      activityLogs: sortedLogs 
    });
  };

  const handleApplyFilter = () => {
    applyFilterAndCalculate(rawStore.orders, rawStore.books, rawStore.users, rawStore.logs, dateRange.start, dateRange.end);
  };

  const handleClearFilter = () => {
    setDateRange({ start: '', end: '' });
    applyFilterAndCalculate(rawStore.orders, rawStore.books, rawStore.users, rawStore.logs, '', '');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '16px', color: '#666' }}>Đang tải số liệu hệ thống...</div>;
  }

  // 🌟 LOGIC LỌC TÀI KHOẢN (TRƯỚC KHI RENDER)
  const filteredActivityLogs = stats.activityLogs.filter(log => {
    if (logRoleFilter === 'All') return true;
    
    // Đưa chuỗi người dùng về viết thường để so sánh chính xác
    const userStr = (log.userId || log.UserId || '').toLowerCase();
    const isAdmin = userStr.includes('quản trị') || userStr.includes('admin');
    const isStaff = userStr.includes('nhân viên') || userStr.includes('staff');
    
    if (logRoleFilter === 'Admin') return isAdmin;
    if (logRoleFilter === 'Staff') return isStaff;
    if (logRoleFilter === 'Customer') return !isAdmin && !isStaff;
    
    return true;
  });

  return (
    <div style={{ padding: '25px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* HEADER CÓ BỘ LỌC THỜI GIAN */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontWeight: 'bold' }}>Dashboard Quản Trị</h2>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>Hệ thống tự động cập nhật số liệu kinh doanh cửa hàng sách.</p>
        </div>
        
        {/* THANH CÔNG CỤ LỌC */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fff', padding: '10px 18px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>Từ:</span>
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none', color: '#374151' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>Đến:</span>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none', color: '#374151' }} />
          </div>
          
          <button onClick={handleApplyFilter} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)' }}>
            <FaFilter /> Lọc
          </button>
          
          {(dateRange.start || dateRange.end) && (
            <button onClick={handleClearFilter} title="Xóa bộ lọc" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
              <FaTimes />
            </button>
          )}

          <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 4px' }}></div>
          
          <button onClick={fetchAllDashboardData} title="Làm mới số liệu" style={{ width: '34px', height: '34px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(16, 185, 129, 0.3)', transition: '0.2s' }}>
            <FaSync size={13} />
          </button>
        </div>
      </div>

      {/* ================= 4 KHỐI THỐNG KÊ SỐ LƯỢNG CHÍNH ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        
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

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #f39c12' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>📦 TỔNG ĐƠN HÀNG {dateRange.start && "(LỌC)"}</p>
              <h3 style={{ margin: 0, color: '#d35400', fontSize: '24px' }}>{stats.totalOrders}</h3>
            </div>
            <div style={{ backgroundColor: '#fef5e7', padding: '12px', borderRadius: '50%', color: '#f39c12' }}>
              <FaBoxOpen size={20} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #2ecc71' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>💰 DOANH THU THỰC</p>
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
              <div style={{ width: '100%', textAlign: 'center', color: '#888', paddingTop: '70px' }}>Chưa có dữ liệu doanh thu trong khoảng thời gian này.</div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#e67e22', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFire color="#e67e22" /> Top sách bán chạy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.topSellingBooks.length > 0 ? stats.topSellingBooks.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f2f2f2' }}>
                <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {idx + 1}. {b.title}
                </span>
                <span style={{ backgroundColor: '#fef5e7', color: '#d35400', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                  Đã bán: {b.sold}
                </span>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: '#888', paddingTop: '30px' }}>Chưa có dữ liệu đơn hàng.</div>
            )}
          </div>
        </div>

      </div>

      {/* ================= 7 & 8. ĐƠN HÀNG MỚI NHẤT & CẢNH BÁO TỒN KHO ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaShoppingCart color="#2980b9" /> Đơn hàng mới nhất
            </h3>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '10px' }}>Mã đơn</th>
                <th style={{ padding: '10px' }}>Ngày đặt</th>
                <th style={{ padding: '10px' }}>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length > 0 ? stats.recentOrders.map(o => {
                const total = o.totalAmount ?? o.TotalAmount ?? o.total ?? o.Total ?? o.tongTien ?? o.TongTien ?? 0;
                const id = o.id ?? o.Id ?? o.maDonHang ?? o.MaDonHang ?? 'N/A';
                const dateString = o.orderDate ?? o.OrderDate ?? o.ngayDat ?? o.NgayDat ?? Date.now();
                const utcDate = typeof dateString === 'string' && !dateString.endsWith('Z') ? `${dateString}Z` : dateString;
                const dateObj = new Date(utcDate);
                const displayDate = isNaN(dateObj.getTime()) ? new Date().toLocaleDateString('vi-VN') : dateObj.toLocaleDateString('vi-VN');

                return (
                  <tr key={id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#34495e' }}>#{id}</td>
                    <td style={{ padding: '10px', color: '#666' }}>{displayDate}</td>
                    <td style={{ padding: '10px', color: '#e74c3c', fontWeight: 'bold' }}>{total.toLocaleString('vi-VN')} đ</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Chưa có đơn hàng nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#e74c3c', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExclamationTriangle color="#e74c3c" /> Sách sắp hết hàng (&lt; 5 cuốn)
            </h3>
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
                const stockVal = b.stockQuantity ?? b.StockQuantity ?? b.quantity ?? b.Quantity ?? b.stock ?? b.Stock ?? b.soLuongTon ?? b.SoLuongTon ?? 0;
                const title = b.title ?? b.Title ?? b.tenSach ?? b.TenSach ?? 'Sách';
                const author = b.author ?? b.Author ?? b.tacGia ?? b.TacGia ?? 'Đang cập nhật';
                const id = b.id ?? b.Id ?? b.maSach ?? b.MaSach;

                return (
                  <tr key={id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#2c3e50' }}>{title}</td>
                    <td style={{ padding: '10px', color: '#666' }}>{author}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ backgroundColor: '#fdedec', color: '#c0392b', padding: '3px 10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}>
                        {stockVal} cuốn
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>Kho hàng đầy đủ.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 9. LỊCH SỬ THAO TÁC CÓ THANH CUỘN & BỘ LỌC ================= */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, color: '#8e44ad', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHistory color="#8e44ad" /> Lịch sử thao tác {dateRange.start && "(Lọc theo ngày)"}
          </h3>
          
          {/* 🌟 NÚT DROPDOWN LỌC TÀI KHOẢN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>Người thao tác:</span>
            <select 
              value={logRoleFilter}
              onChange={(e) => setLogRoleFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', outline: 'none', cursor: 'pointer', backgroundColor: '#f9fafb', color: '#374151', fontWeight: '600' }}
            >
              <option value="All">Tất cả mọi người</option>
              <option value="Admin">Quản Trị Viên</option>
              <option value="Staff">Nhân Viên</option>
              <option value="Customer">Khách Hàng</option>
            </select>
          </div>
        </div>
        
        {/* Khung chứa bảng có thanh cuộn dọc (Scroll) */}
        <div style={{ maxHeight: '350px', overflowY: 'auto', overflowX: 'auto', border: '1px solid #f3f4f6', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead style={{ backgroundColor: '#f9fafb', color: '#4b5563', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={{ padding: '12px 15px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#f9fafb' }}>Thời gian</th>
                <th style={{ padding: '12px 15px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#f9fafb' }}>Người thao tác</th>
                <th style={{ padding: '12px 15px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#f9fafb' }}>Hành động</th>
                <th style={{ padding: '12px 15px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#f9fafb' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivityLogs.length > 0 ? (
                filteredActivityLogs.map((log, index) => {
                  const action = log.action || log.Action || "Thay đổi";
                  return (
                    <tr key={log.id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 15px', fontSize: '13px', color: '#6b7280' }}>
                        {new Date(log.timestamp || log.Timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>
                        {log.userId || log.UserId}
                      </td>
                      <td style={{ padding: '12px 15px' }}>
                        <span style={{ 
                          backgroundColor: action === 'Xóa' ? '#fee2e2' : action.includes('Thêm') ? '#dcfce7' : '#fef3c7', 
                          color: action === 'Xóa' ? '#dc2626' : action.includes('Thêm') ? '#16a34a' : '#d97706',
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' 
                        }}>
                          {action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px', fontSize: '13px', color: '#4b5563' }}>
                        {log.details || log.Details}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: '14px', backgroundColor: '#f9fafb' }}>
                    Không có lịch sử thao tác nào của nhóm tài khoản này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 10. SAO LƯU VÀ PHỤC HỒI DỮ LIỆU ================= */}
      <BackupRestoreSection />

    </div>
  );
}