import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBoxOpen, FaTruck, FaCheckCircle, FaExclamationTriangle, 
  FaSearch, FaFilter, FaEye, FaCheck, FaTimes, 
  FaHome, FaClipboardList, FaBox, FaUsers, FaSignOutAlt, FaBell,
  FaPrint, FaArrowRight, FaClipboardCheck, FaFileExcel, FaSync,
  FaUserAlt, FaChartBar, FaCalendarAlt, FaStore, FaPlus, FaEdit, FaListUl, FaFire 
} from 'react-icons/fa';

// Tự động nhận diện URL API thực tế khi đưa lên mạng
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://18.232.139.209:5000/api'; 

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard'); 
  
  // STATES DỮ LIỆU
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [stats, setStats] = useState({
    pendingOrders: 0, shippingOrders: 0, completedToday: 0, lowStockBooks: 0,
    topSellingBooks: [], topBuyers: [] 
  });
  
  const [loading, setLoading] = useState(false);
  
  // STATES TÌM KIẾM, BỘ LỌC VÀ SẮP XẾP
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [sortStock, setSortStock] = useState('default'); 
  
  // STATES MODAL CHI TIẾT
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const formatOrderDate = (dateString) => {
    if (!dateString) return 'Đang cập nhật...';
    const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const dateObj = new Date(utcDateString);
    if (isNaN(dateObj.getTime())) return new Date(dateString).toLocaleDateString('vi-VN');
    const time = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} ${date}`;
  };

  const getDisplayStatus = (status) => {
    const clean = status ? status.trim() : '';
    switch (clean) {
      case 'ChoXuLy': return 'Chờ xử lý';
      case 'DaXacNhan': return 'Đã xác nhận';
      case 'DangGiao': return 'Đang giao';
      case 'HoanTat': return 'Hoàn tất';
      case 'DaHuy': return 'Đã hủy';
      default: return clean;
    }
  };

  // ================= CÁC HÀM "HỨNG" DỮ LIỆU AN TOÀN ĐA TẦNG =================
  const getBookStock = (b) => {
    const stock = b.stockQuantity ?? b.StockQuantity ?? b.soLuongTon ?? b.SoLuongTon ?? b.soluongton ?? b.soLuong ?? b.SoLuong ?? b.Quantity ?? b.quantity ?? b.stock ?? b.Stock;
    return stock !== undefined && stock !== null ? parseInt(stock, 10) : 0;
  };
  const getBookCategory = (b) => b.categoryName ?? b.CategoryName ?? b.loaiSach ?? b.LoaiSach ?? b.loaisach ?? b.theLoai ?? b.TheLoai ?? b.category ?? b.Category ?? 'Khác';
  const getBookPrice = (b) => b.price ?? b.Price ?? b.giaBan ?? b.GiaBan ?? b.giaban ?? 0;
  const getBookTitle = (b) => b.title ?? b.Title ?? b.tenSach ?? b.TenSach ?? b.tensach ?? 'Sách';
  const getBookAuthor = (b) => b.author ?? b.Author ?? b.tacGia ?? b.TacGia ?? b.tacgia ?? 'Đang cập nhật';
  const getBookId = (b) => b.id ?? b.Id ?? b.maSach ?? b.MaSach ?? b.masach ?? 'N/A';
  const getBookImg = (b) => b.imageUrl ?? b.ImageUrl ?? b.image ?? b.Image ?? b.anhSach ?? b.AnhSach ?? 'https://placehold.co/50x70?text=No+Image';

  // ================= 1. FETCH DATA ĐƠN HÀNG & TÍNH TOP 10 =================
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statRes = await fetch(`${API_BASE_URL}/orders/staff-stats`, { headers: getAuthHeaders() });
      let currentStats = { pendingOrders: 0, shippingOrders: 0, completedToday: 0, lowStockBooks: 0 };
      if (statRes.ok) currentStats = await statRes.json();

      // 🌟 LẤY DANH SÁCH KHÁCH HÀNG ĐỂ TÌM MÃ KH DÙ API ĐƠN HÀNG CÓ THIẾU
      let usersList = [];
      try {
        const userRes = await fetch(`${API_BASE_URL}/auth/users`, { headers: getAuthHeaders() });
        if(userRes.ok) {
            const uData = await userRes.json();
            usersList = Array.isArray(uData) ? uData : (uData.data || uData.items || []);
        }
      } catch(e) {}

      const orderRes = await fetch(`${API_BASE_URL}/orders/all`, { headers: getAuthHeaders() });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        const sortedData = Array.isArray(orderData) ? orderData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) : [];
        
        // --- LOGIC TÍNH TOÁN TOP 10 ---
        const completedOrders = sortedData.filter(o => getDisplayStatus(o.status) === 'Hoàn tất');
        const bookCount = {};
        const customerCount = {};

        completedOrders.forEach(o => {
          const name = o.customerName || o.CustomerName || o.fullName || 'Khách vãng lai';
          const phone = o.phone || o.phoneNumber || o.PhoneNumber || 'Trống';
          
          // Tự động dò tìm Mã KH
          let customerId = o.userId || o.UserId || o.customerId || o.CustomerId || o.maKhachHang || o.MaKhachHang || o.appUserId || o.AppUserId;
          if (!customerId) {
              const matched = usersList.find(u => 
                  (phone !== 'Trống' && (u.phoneNumber === phone || u.phone === phone)) || 
                  ((u.fullName || u.FullName || u.hoTenKh || u.HoTenKh) === name)
              );
              if (matched) customerId = matched.id || matched.maKhachHang || matched.MaKhachHang;
          }

          // Định dạng: TÊN - MÃ KH
          const displayCode = customerId ? customerId : (phone !== 'Trống' ? phone : 'Khách Lẻ');
          const customerKey = `${name} - ${displayCode}`; // Đưa Tên lên trước

          const items = o.orderItems || o.items || o.chiTietDonHang || [];
          let totalBooksInOrder = 0;

          items.forEach(i => {
            const title = i.bookTitle || i.productName || i.tenSach || 'Sản phẩm';
            const qty = i.quantity || i.soLuong || 1;
            bookCount[title] = (bookCount[title] || 0) + qty;
            totalBooksInOrder += qty;
          });

          if (totalBooksInOrder > 0) {
            customerCount[customerKey] = (customerCount[customerKey] || 0) + totalBooksInOrder;
          }
        });

        // Lấy Top 10
        const topSellingBooks = Object.entries(bookCount).map(([title, qty]) => ({ title, qty })).sort((a, b) => b.qty - a.qty).slice(0, 10);
        const topBuyers = Object.entries(customerCount).map(([info, qty]) => ({ info, qty })).sort((a, b) => b.qty - a.qty).slice(0, 10);

        setStats({ ...currentStats, topSellingBooks, topBuyers });

        const formattedOrders = sortedData.map(o => {
          const rawName = o.customerName || o.CustomerName || o.fullName || 'Khách vãng lai';
          const phone = o.phone || o.phoneNumber || o.PhoneNumber || 'Trống';
          
          let cId = o.userId || o.UserId || o.customerId || o.CustomerId || o.maKhachHang || o.MaKhachHang || o.appUserId || o.AppUserId;
          if (!cId) {
              const matched = usersList.find(u => 
                  (phone !== 'Trống' && (u.phoneNumber === phone || u.phone === phone)) || 
                  ((u.fullName || u.FullName || u.hoTenKh || u.HoTenKh) === rawName)
              );
              if (matched) cId = matched.id || matched.maKhachHang || matched.MaKhachHang;
          }
          
          // Định dạng chuẩn: TÊN - MÃ KH để hiển thị trên bảng
          const displayName = cId ? `${rawName} - ${cId}` : rawName; // Đưa Tên lên trước

          return {
            id: o.id,
            name: displayName,
            phone: phone,
            item: o.itemSummary || (o.orderItems || o.items || []).map(i => i.bookTitle || i.productName).join(', ') || 'Sản phẩm',
            rawTotal: o.totalAmount !== undefined ? o.totalAmount : (o.total || 0),
            status: getDisplayStatus(o.status),
            statusColor: getStatusColor(o.status),
            date: o.orderDate ? formatOrderDate(o.orderDate) : 'Đang cập nhật',
            rawDate: o.orderDate ? new Date(o.orderDate) : new Date()
          }
        });
        setOrders(formattedOrders);
      } else if (orderRes.status === 401) {
        handleLogout();
      }
    } catch (error) { console.error("Lỗi tải đơn hàng:", error); }
    finally { setLoading(false); }
  };

  // ================= 2. FETCH DATA SẢN PHẨM & KHO =================
  const fetchBooks = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${API_BASE_URL}/books`, { headers: getAuthHeaders() });
      if (!res.ok && res.status === 404) res = await fetch(`${API_BASE_URL}/sach`, { headers: getAuthHeaders() });
      if (!res.ok && res.status === 404) res = await fetch(`${API_BASE_URL}/Book`, { headers: getAuthHeaders() });

      if (res.ok) {
        const data = await res.json();
        const bookList = Array.isArray(data) ? data : (data.data || data.items || []);
        setBooks(bookList);
      } else {
        setBooks([]);
      }
    } catch (error) { 
      console.error("Lỗi tải sách:", error); setBooks([]);
    } finally { setLoading(false); }
  };

  // ================= 3. FETCH DATA KHÁCH HÀNG =================
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${API_BASE_URL}/auth/users`, { headers: getAuthHeaders() });
      if (!res.ok && res.status === 404) res = await fetch(`${API_BASE_URL}/khachhang`, { headers: getAuthHeaders() });

      if (res.ok) {
        const data = await res.json();
        const usersArray = Array.isArray(data) ? data : (data.data || data.items || []);
        const onlyCustomers = usersArray.filter(u => u.role === 'User' || u.Role === 'User' || !u.role);
        setCustomers(onlyCustomers);
      } else {
        setCustomers([]);
      }
    } catch (error) { 
      console.error("Lỗi tải khách hàng:", error); setCustomers([]);
    } finally { setLoading(false); }
  };

  // ================= 4. FETCH DATA DANH MỤC =================
  const fetchCategories = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() });
      if (!res.ok && res.status === 404) res = await fetch(`${API_BASE_URL}/danhmuc`, { headers: getAuthHeaders() });

      if (res.ok) {
        const data = await res.json();
        const categoryList = Array.isArray(data) ? data : (data.data || data.items || []);
        setCategories(categoryList);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh mục:", error); setCategories([]);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchBooks();
  }, []);

  useEffect(() => {
    setSearchTerm('');
    setStatusFilter('Tất cả');
    setSortStock('default');
    
    if (activeMenu === 'orders' || activeMenu === 'dashboard') fetchDashboardData();
    if (activeMenu === 'inventory') fetchBooks();
    if (activeMenu === 'customers') fetchCustomers();
    if (activeMenu === 'categories') fetchCategories(); 
  }, [activeMenu]);

  const displayOrders = orders.filter(o => 
    (searchTerm === '' || o.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) || o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.phone.includes(searchTerm)) &&
    (statusFilter === 'Tất cả' || o.status === statusFilter)
  );

  let displayBooks = books.filter(b => {
    const title = getBookTitle(b);
    const author = getBookAuthor(b);
    const category = getBookCategory(b);
    return (searchTerm === '' || title.toLowerCase().includes(searchTerm.toLowerCase()) || author.toLowerCase().includes(searchTerm.toLowerCase())) &&
           (statusFilter === 'Tất cả' || category === statusFilter);
  });

  if (sortStock === 'asc') {
    displayBooks.sort((a, b) => getBookStock(a) - getBookStock(b));
  } else if (sortStock === 'desc') {
    displayBooks.sort((a, b) => getBookStock(b) - getBookStock(a));
  }

  const displayCustomers = customers.filter(c => {
    const name = c.fullName || c.FullName || c.hoTenKh || c.HoTenKh || '';
    const email = c.email || c.Email || '';
    return searchTerm === '' || name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const displayCategories = categories.filter(c => {
    const name = c.categoryName || c.CategoryName || c.tenDanhMuc || c.TenDanhMuc || '';
    const code = c.id || c.maDanhMuc || c.MaDanhMuc || '';
    return searchTerm === '' || name.toLowerCase().includes(searchTerm.toLowerCase()) || code.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleExportExcel = () => {
    if (displayOrders.length === 0) { alert("Không có dữ liệu để xuất!"); return; }
    const headers = ["Mã Đơn Hàng", "Khách Hàng", "Số Điện Thoại", "Sản Phẩm", "Tổng Tiền", "Trạng Thái", "Ngày Đặt"];
    const csvRows = [headers.join(",")];
    
    const escapeCsv = (text) => `"${String(text).replace(/"/g, '""')}"`;

    displayOrders.forEach(o => {
      csvRows.push([escapeCsv(o.id), escapeCsv(o.name), escapeCsv(o.phone), escapeCsv(o.item), o.rawTotal, escapeCsv(o.status), escapeCsv(o.date)].join(","));
    });
    
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `DonHang_${new Date().getTime()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const updateOrderStatus = async (id, newStatus) => {
    if (!window.confirm(`Xác nhận chuyển trạng thái sang: ${newStatus}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ status: newStatus }) });
      if (res.ok) fetchDashboardData(); 
      else alert("Lỗi cập nhật: " + (await res.json()).message);
    } catch { alert("Lỗi kết nối máy chủ."); }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const fullOrder = await res.json();
        fullOrder.statusColor = getStatusColor(fullOrder.status);
        setSelectedOrder(fullOrder); setIsModalOpen(true);
      }
    } catch { alert("Không tải được chi tiết."); }
  };

  const handlePrint = () => {
    const invoiceElement = document.getElementById('printable-invoice');
    if (!invoiceElement) { alert("Mở chi tiết trước khi in!"); return; }
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    printWindow.document.write(`<html><head><title>In hóa đơn</title><style>body{font-family:Arial;padding:20px} h2,h3{text-align:center;color:#2c3e50} table{width:100%;border-collapse:collapse;margin-top:20px} th,td{border:1px solid #ddd;padding:10px} th{background:#f8fafc}</style></head><body>${invoiceElement.innerHTML}</body></html>`);
    printWindow.document.close(); printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };
  
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Inter, Arial, sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', zIndex: 20 }}>
        <div style={{ padding: '20px 25px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid #334155', color: '#e74c3c' }}>
          Book<span style={{color: 'white'}}>Galaxy</span>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal', marginTop: '5px', letterSpacing: '1px' }}>STAFF PORTAL</div>
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <SidebarItem icon={<FaHome />} label="Tổng quan" active={activeMenu === 'dashboard'} onClick={() => setActiveMenu('dashboard')} />
          <SidebarItem icon={<FaClipboardList />} label="Quản lý Đơn hàng" active={activeMenu === 'orders'} onClick={() => setActiveMenu('orders')} badge={stats.pendingOrders.toString()} />
          <SidebarItem icon={<FaBox />} label="Sản phẩm & Kho" active={activeMenu === 'inventory'} onClick={() => setActiveMenu('inventory')} />
          <SidebarItem icon={<FaListUl />} label="Danh mục sách" active={activeMenu === 'categories'} onClick={() => setActiveMenu('categories')} />
          <SidebarItem icon={<FaUsers />} label="Khách hàng" active={activeMenu === 'customers'} onClick={() => setActiveMenu('customers')} />
        </nav>

        {/* NÚT VỀ TRANG CHỦ & ĐĂNG XUẤT */}
        <div style={{ padding: '15px 20px', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <SidebarItem icon={<FaStore />} label="Về trang chủ" color="#38bdf8" onClick={() => navigate('/')} />
          <SidebarItem icon={<FaSignOutAlt />} label="Đăng xuất" color="#ef4444" onClick={handleLogout} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* HEADER */}
        <header style={{ height: '75px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', zIndex: 10, flexShrink: 0 }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>Bảng Điều Khiển Nhân Viên</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowNotifications(!showNotifications)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%' }}>
                <FaBell size={18} color="#475569" />
                {stats.pendingOrders > 0 && <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '10px', height: '10px', border: '2px solid white' }}></span>}
              </div>
              {showNotifications && (
                <div style={{ position: 'absolute', top: '50px', right: '0', width: '320px', backgroundColor: 'white', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden' }}>
                  <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f8fafc' }}>Thông báo</div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {stats.pendingOrders > 0 ? (
                      <div style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center' }} onClick={() => { setActiveMenu('orders'); setStatusFilter('Chờ xử lý'); setShowNotifications(false); }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><FaClipboardList /></div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{stats.pendingOrders} đơn hàng chờ xử lý</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Nhấn để xem ngay</div>
                        </div>
                      </div>
                    ) : <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Không có thông báo mới.</div>}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #e2e8f0', paddingLeft: '25px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#0284c7', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>NV</div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Nhân Viên Bán Hàng</div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          {/* ================= 1. TAB DASHBOARD ================= */}
          {activeMenu === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <StatCard icon={<FaBoxOpen />} title="Đơn Chờ Xử Lý" value={stats.pendingOrders} color="#d97706" bg="#fef3c7" />
                <StatCard icon={<FaTruck />} title="Đơn Đang Giao" value={stats.shippingOrders} color="#0284c7" bg="#e0f2fe" />
                <StatCard icon={<FaCheckCircle />} title="Hoàn Tất (Hôm nay)" value={stats.completedToday} color="#16a34a" bg="#dcfce7" />
                <StatCard icon={<FaExclamationTriangle />} title="Sách Sắp Hết Kho" value={stats.lowStockBooks} color="#dc2626" bg="#fee2e2" />
              </div>

              {/* 🌟 2 BẢNG TOP 10 (SÁCH VÀ KHÁCH HÀNG) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                {/* Top 10 Sách */}
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                    <FaFire color="#ef4444" /> Top 10 Sách Bán Chạy Nhất
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {stats.topSellingBooks && stats.topSellingBooks.length > 0 ? stats.topSellingBooks.map((b, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                              <span style={{ fontWeight: 'bold', color: idx < 3 ? '#ef4444' : '#64748b', width: '20px' }}>#{idx + 1}</span>
                              <span style={{ fontSize: '14px', color: '#334155', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</span>
                            </div>
                            <span style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{b.qty} cuốn</span>
                          </div>
                      )) : <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu sách bán chạy.</div>}
                  </div>
                </div>

                {/* Top 10 Khách Hàng */}
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                    <FaUsers color="#8b5cf6" /> Top 10 Khách Hàng VIP
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {stats.topBuyers && stats.topBuyers.length > 0 ? stats.topBuyers.map((c, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                              <span style={{ fontWeight: 'bold', color: idx < 3 ? '#8b5cf6' : '#64748b', width: '20px' }}>#{idx + 1}</span>
                              <span style={{ fontSize: '14px', color: '#334155', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.info}</span>
                            </div>
                            <span style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{c.qty} cuốn</span>
                          </div>
                      )) : <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu khách hàng.</div>}
                  </div>
                </div>
              </div>

              {/* BẢNG ĐƠN HÀNG MỚI VÀ CẢNH BÁO TỒN KHO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '25px' }}>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', marginBottom: '18px', width: '100%' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                      <FaClipboardList color="#0284c7" /> Đơn hàng mới nhất
                    </h3>
                    <button onClick={() => setActiveMenu('orders')} style={{ border: 'none', background: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                      Xem tất cả →
                    </button>
                  </div>
                  
                  <div style={{ flex: 1, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                          <th style={{ padding: '10px 8px' }}>Mã ĐH</th>
                          <th style={{ padding: '10px 8px' }}>Khách hàng</th>
                          <th style={{ padding: '10px 8px' }}>Tổng tiền</th>
                          <th style={{ padding: '10px 8px', textAlign: 'center' }}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((o, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#0284c7' }}>{o.id}</td>
                            <td style={{ padding: '12px 8px', color: '#1e293b', fontWeight: '500' }}>{o.name}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#e11d48' }}>{formatCurrency(o.rawTotal)}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              <span style={{ backgroundColor: `${o.statusColor}20`, color: o.statusColor, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Chưa có đơn hàng nào.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', marginBottom: '18px', width: '100%' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                      <FaExclamationTriangle color="#dc2626" /> Sách sắp hết kho (&lt;5 cuốn)
                    </h3>
                    <button onClick={() => setActiveMenu('inventory')} style={{ border: 'none', background: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                      Kho hàng →
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                    {books.filter(b => getBookStock(b) < 5).length > 0 ? (
                      books.filter(b => getBookStock(b) < 5).map((b, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #dc2626' }}>
                          <div style={{ overflow: 'hidden', paddingRight: '10px' }}>
                            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getBookTitle(b)}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Tác giả: {getBookAuthor(b)}</div>
                          </div>
                          <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Còn: {getBookStock(b)}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#10b981', fontSize: '14px', fontWeight: '600', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                        Tuyệt vời! Kho hàng đầy đủ, không có sách sắp hết.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. TAB QUẢN LÝ ĐƠN HÀNG ================= */}
          {activeMenu === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '320px' }}>
                    <FaSearch style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '14px', color: '#94a3b8' }} />
                    <input type="text" placeholder="Tìm mã, tên khách, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer' }}>
                    <option value="Tất cả">Tất cả trạng thái</option>
                    <option value="Chờ xử lý">Chờ xử lý</option>
                    <option value="Đã xác nhận">Đã xác nhận</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Hoàn tất">Hoàn tất</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={fetchDashboardData} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><FaSync /> Làm mới</button>
                  <button onClick={handleExportExcel} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><FaFileExcel /> Xuất Excel</button>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                    {displayOrders.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>{loading ? 'Đang tải...' : 'Không có đơn hàng nào.'}</td></tr> : 
                     displayOrders.map((order, idx) => (
                      <TableRow key={idx} {...order} total={formatCurrency(order.rawTotal)} onApprove={() => updateOrderStatus(order.id, 'Đang giao')} onComplete={() => updateOrderStatus(order.id, 'Hoàn tất')} onCancel={() => updateOrderStatus(order.id, 'Đã hủy')} onView={() => handleViewOrder(order.id)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3. TAB SẢN PHẨM & KHO ================= */}
          {activeMenu === 'inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '280px' }}>
                    <FaSearch style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '14px', color: '#94a3b8' }} />
                    <input type="text" placeholder="Tìm tên sách, tác giả..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={fetchBooks} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><FaSync /> Làm mới</button>
                  <button onClick={() => navigate('/staff/books/add')} style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><FaPlus /> Thêm sách mới</button>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '16px 25px', width: '60px' }}>Ảnh</th>
                      <th style={{ padding: '16px 20px' }}>Mã Sách</th>
                      <th style={{ padding: '16px 20px' }}>Tên Sách</th>
                      <th style={{ padding: '16px 20px' }}>Thể Loại</th>
                      <th style={{ padding: '16px 20px' }}>Giá Bán</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center' }}>Tồn Kho</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '14px', color: '#334155' }}>
                    {displayBooks.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>{loading ? 'Đang tải...' : 'Chưa có dữ liệu sách.'}</td></tr> : 
                     displayBooks.map((book, idx) => {
                       const stock = getBookStock(book);
                       const price = getBookPrice(book);
                       const id = getBookId(book);
                       const title = getBookTitle(book);
                       const author = getBookAuthor(book);
                       const category = getBookCategory(book);
                       const img = getBookImg(book);

                       return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 25px' }}><img src={img} alt="bia-sach" style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} /></td>
                          <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0284c7' }}>{id}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{title}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{author}</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}><span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{category}</span></td>
                          <td style={{ padding: '16px 20px', fontWeight: '700', color: '#e11d48' }}>{formatCurrency(price)}</td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}><span style={{ fontWeight: 'bold', color: stock < 10 ? '#ef4444' : '#10b981', backgroundColor: stock < 10 ? '#fee2e2' : '#dcfce7', padding: '4px 12px', borderRadius: '20px' }}>{stock}</span></td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                             <button title="Sửa thông tin sách" onClick={() => navigate(`/staff/books/edit/${id}`)} style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', color: '#495057', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}><FaEdit /></button>
                          </td>
                        </tr>
                       );
                     })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 4. TAB QUẢN LÝ DANH MỤC ================= */}
          {activeMenu === 'categories' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '350px' }}>
                    <FaSearch style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '14px', color: '#94a3b8' }} />
                    <input type="text" placeholder="Tìm kiếm theo mã hoặc tên danh mục..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button onClick={fetchCategories} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><FaSync /> Làm mới</button>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '16px 25px' }}>Mã DM</th>
                      <th style={{ padding: '16px 25px' }}>Tên Danh Mục</th>
                      <th style={{ padding: '16px 25px' }}>Thuộc Nhóm</th>
                      <th style={{ padding: '16px 25px' }}>Slug</th>
                      <th style={{ padding: '16px 25px' }}>Mô Tả</th>
                      <th style={{ padding: '16px 25px', textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '14px', color: '#334155' }}>
                    {displayCategories.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px' }}>{loading ? 'Đang tải...' : 'Chưa có dữ liệu danh mục.'}</td></tr> : 
                     displayCategories.map((cat, idx) => {
                       const id = cat.maDanhMuc || cat.MaDanhMuc || cat.id || 'N/A';
                       const name = cat.tenDanhMuc || cat.TenDanhMuc || cat.categoryName || 'N/A';
                       const parent = cat.thuocNhom || cat.ThuocNhom || cat.parentGroup || '--- (Gốc) ---';
                       const slug = cat.slug || cat.Slug || 'N/A';
                       const desc = cat.moTa || cat.MoTa || cat.description || '';

                       return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 25px', fontWeight: 'bold', color: '#334155' }}>{id}</td>
                          <td style={{ padding: '16px 25px', fontWeight: 'bold', color: parent === '--- (Gốc) ---' ? '#e74c3c' : '#334155' }}>
                            {parent === '--- (Gốc) ---' ? `📂 ${name}` : `↳ ${name}`}
                          </td>
                          <td style={{ padding: '16px 25px', color: '#64748b' }}>{parent}</td>
                          <td style={{ padding: '16px 25px' }}>{slug}</td>
                          <td style={{ padding: '16px 25px', color: '#64748b' }}>{desc}</td>
                          <td style={{ padding: '16px 25px', textAlign: 'center' }}>
                            <button title="Sửa danh mục" style={{ backgroundColor: '#f1c40f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FaEdit />
                            </button>
                          </td>
                        </tr>
                       );
                     })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 5. TAB KHÁCH HÀNG ================= */}
          {activeMenu === 'customers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '320px' }}>
                  <FaSearch style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '14px', color: '#94a3b8' }} />
                  <input type="text" placeholder="Tìm tên khách hàng, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <button onClick={fetchCustomers} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><FaSync /> Làm mới</button>
              </div>

              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '16px 25px' }}>Mã KH</th>
                      <th style={{ padding: '16px 25px' }}>Khách Hàng</th>
                      <th style={{ padding: '16px 25px' }}>Email Liên Hệ</th>
                      <th style={{ padding: '16px 25px', textAlign: 'center' }}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '14px', color: '#334155' }}>
                    {displayCustomers.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '50px' }}>{loading ? 'Đang tải...' : 'Chưa có dữ liệu khách hàng.'}</td></tr> : 
                     displayCustomers.map((cus, idx) => {
                       const statusNum = cus.status !== undefined ? cus.status : (cus.TrangThai !== undefined ? cus.TrangThai : 1);
                       const isActive = statusNum === 1;

                       return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 25px', fontWeight: '600', color: '#0284c7' }}>{cus.id || cus.maKhachHang || cus.MaKhachHang || 'N/A'}</td>
                          <td style={{ padding: '16px 25px', fontWeight: '600', color: '#1e293b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><FaUserAlt size={14}/></div>
                              {cus.fullName || cus.FullName || cus.hoTenKh || cus.HoTenKh || 'Khách Hàng'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 25px' }}>{cus.email || cus.Email || 'Không có email'}</td>
                          <td style={{ padding: '16px 25px', textAlign: 'center' }}>
                            <span style={{ backgroundColor: isActive ? '#dcfce7' : '#fee2e2', color: isActive ? '#10b981' : '#ef4444', padding: '4px 12px', borderRadius: '20px', fontWeight: '600', fontSize: '12px' }}>
                              {isActive ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                        </tr>
                       );})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {isModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', width: '650px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'fadeIn 0.2s ease', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '16px 20px', zIndex: 10000, display: 'flex', justifyContent: 'flex-end', width: '100%', pointerEvents: 'none' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ pointerEvents: 'auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', width: '34px', height: '34px', fontSize: '16px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}><FaTimes /></button>
            </div>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>Chi Tiết Đơn Hàng: <span style={{ color: '#0284c7' }}>{selectedOrder.id}</span></h3>
            </div>
            
            <div id="printable-invoice" style={{ padding: '30px', overflowY: 'auto', backgroundColor: '#fff' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #2c3e50', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '22px' }}>BOOK GALAXY STORE</h2>
                <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#666' }}>Phiếu giao hàng / Hóa đơn bán lẻ</p>
                <h3 style={{ margin: '15px 0 0', color: '#2980b9', fontSize: '18px' }}>Mã đơn: {selectedOrder.id}</h3>
              </div>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '6px' }}>
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                  <div><b>Họ tên:</b> {selectedOrder.customerName || selectedOrder.fullName}</div>
                  <div><b>Điện thoại:</b> {selectedOrder.phone || selectedOrder.phoneNumber}</div>
                  <div><b>Địa chỉ giao:</b> {selectedOrder.address || selectedOrder.shippingAddress}</div>
                  <div><b>Thanh toán:</b> {selectedOrder.paymentMethod || 'COD'}</div>
                  <div><b>Ngày đặt hàng:</b> {formatOrderDate(selectedOrder.orderDate)}</div>
                  <div><b>Trạng thái:</b> {getDisplayStatus(selectedOrder.status)}</div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', marginBottom: '20px' }}>
                <thead><tr style={{ backgroundColor: '#f4f6f8' }}><th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Tên Sách</th><th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>SL</th><th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Thành tiền</th></tr></thead>
                <tbody>
                  {(selectedOrder.orderItems || selectedOrder.items || []).map((item, idx) => (
                    <tr key={idx}><td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{item.bookTitle || item.productName}</td><td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.quantity}</td><td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} đ</td></tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', borderTop: '2px dashed #ddd', paddingTop: '15px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '15px' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#e74c3c' }}>{formatCurrency(selectedOrder.totalAmount || 0)}</span>
              </div>
            </div>

            <div style={{ padding: '18px 25px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>Đóng lại</button>
              <button onClick={handlePrint} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0284c7', cursor: 'pointer', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}><FaPrint/> In vận đơn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
  const clean = status ? status.trim() : '';
  switch (clean) { 
    case 'ChoXuLy': case 'Chờ xử lý': return '#f59e0b'; 
    case 'DaXacNhan': case 'Đã xác nhận': return '#8b5cf6'; 
    case 'DangGiao': case 'Đang giao': return '#3b82f6'; 
    case 'HoanTat': case 'Hoàn tất': return '#10b981'; 
    case 'DaHuy': case 'Đã hủy': return '#ef4444'; 
    default: return '#64748b'; 
  }
};

const SidebarItem = ({ icon, label, active, onClick, color, badge }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '16px 25px', cursor: 'pointer', backgroundColor: active ? '#334155' : 'transparent', color: color || (active ? '#fff' : '#94a3b8'), borderLeft: active ? '4px solid #38bdf8' : '4px solid transparent', transition: 'all 0.2s ease' }}>
    <span style={{ fontSize: '18px', marginRight: '15px' }}>{icon}</span><span style={{ flex: 1, fontSize: '15px', fontWeight: active ? '600' : '400' }}>{label}</span>
    {badge && badge !== "0" && <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '20px', fontWeight: 'bold' }}>{badge}</span>}
  </div>
);

const StatCard = ({ icon, title, value, color, bg }) => (
  <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: bg, color: color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>{icon}</div>
    <div><div style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>{title}</div><div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{value}</div></div>
  </div>
);

const iconBtn = { width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' };

const TableRow = ({ id, name, phone, item, total, status, statusColor, onApprove, onComplete, onCancel, onView }) => (
  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
    <td style={{ padding: '16px 25px', fontWeight: '700', color: '#0284c7' }}>{id}</td>
    <td style={{ padding: '16px 25px' }}><div style={{ fontWeight: '600', color: '#1e293b' }}>{name}</div><div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{phone}</div></td>
    <td style={{ padding: '16px 25px', color: '#475569' }}>{item}</td>
    <td style={{ padding: '16px 25px', fontWeight: '700', color: '#e11d48' }}>{total}</td>
    <td style={{ padding: '16px 25px', textAlign: 'center' }}><span style={{ backgroundColor: `${statusColor}20`, color: statusColor, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'inline-block', minWidth: '75px', textAlign: 'center', whiteSpace: 'nowrap' }}>{status}</span></td>
    <td style={{ padding: '16px 25px' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {status === 'Chờ xử lý' && (<><button title="Duyệt đơn" onClick={onApprove} style={{ ...iconBtn, backgroundColor: '#0ea5e9' }}><FaCheck /></button><button title="Hủy đơn" onClick={onCancel} style={{ ...iconBtn, backgroundColor: '#ef4444' }}><FaTimes /></button></>)}
        {status === 'Đang giao' && (<button title="Xác nhận giao xong" onClick={onComplete} style={{ ...iconBtn, backgroundColor: '#10b981' }}><FaClipboardCheck size={16} /></button>)}
        <button title="Xem chi tiết (IN HÓA ĐƠN)" onClick={onView} style={{ ...iconBtn, backgroundColor: '#64748b', width: '38px' }}><FaEye /></button>
      </div>
    </td>
  </tr>
);

export default StaffDashboard;