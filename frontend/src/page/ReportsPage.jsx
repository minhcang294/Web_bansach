import React, { useState, useEffect } from 'react';
import { 
  FaDollarSign, FaFileInvoiceDollar, FaBook, 
  FaChartBar, FaCalendarAlt, FaFilter, FaFileExcel // THÊM ICON EXCEL
} from 'react-icons/fa';

// THÊM THƯ VIỆN XUẤT EXCEL
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days'); // '30days', 'year', 'all'

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchData();
  }, []);

  // ================= CÁC HÀM "HỨNG" DỮ LIỆU ĐA NĂNG =================
  const getOrderTotal = (o) => o.totalAmount ?? o.TotalAmount ?? o.total ?? o.Total ?? o.tongTien ?? o.TongTien ?? 0;
  const getOrderStatus = (o) => o.status ?? o.Status ?? o.trangThai ?? o.TrangThai ?? '';
  const getOrderDate = (o) => o.orderDate ?? o.OrderDate ?? o.ngayDat ?? o.NgayDat ?? Date.now();
  const getOrderId = (o) => o.id ?? o.Id ?? o.maDonHang ?? o.MaDonHang ?? 'N/A';
  const getOrderItems = (o) => o.orderItems ?? o.OrderItems ?? o.items ?? o.Items ?? o.chiTietDonHang ?? o.ChiTietDonHang ?? [];
  const getItemQty = (item) => item.quantity ?? item.Quantity ?? item.soLuong ?? item.SoLuong ?? 1;
  const getCustomerName = (o) => o.customerName ?? o.CustomerName ?? o.fullName ?? o.FullName ?? o.hoTenKh ?? o.HoTenKh ?? 'Khách vãng lai';

  // ================= HÀM FETCH =================
  const fetchWithFallback = async (urls, headers) => {
    for (const url of urls) {
      try {
        const res = await fetch(`http://localhost:5000${url}`, { headers });
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : (data.items || data.data || data.$values || []);
        }
      } catch (error) { }
    }
    return []; 
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${getToken()}` };
      const data = await fetchWithFallback(['/api/orders/all', '/api/orders', '/api/donhang'], headers);
      setOrders(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. LỌC ĐƠN HÀNG HỢP LỆ & THEO THỜI GIAN
  const completedStatuses = ['HoanTat', 'Hoàn tất', 'Completed', 'completed', 'DaGiao', 'Đã giao'];
  const completedOrders = orders.filter(o => {
    const status = getOrderStatus(o);
    return completedStatuses.includes(status.trim());
  });
  
  const filteredOrders = completedOrders.filter(order => {
    if (timeRange === 'all') return true;
    
    const dateString = getOrderDate(order);
    const utcDate = typeof dateString === 'string' && !dateString.endsWith('Z') ? `${dateString}Z` : dateString;
    const orderDateObj = new Date(utcDate);
    if (isNaN(orderDateObj.getTime())) return true; 

    const now = new Date();
    
    if (timeRange === '30days') {
      const diffTime = Math.abs(now - orderDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    
    if (timeRange === 'year') {
      return orderDateObj.getFullYear() === now.getFullYear();
    }
    
    return true;
  });

  // 2. TÍNH TOÁN CÁC CHỈ SỐ KPI
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const totalOrdersCount = filteredOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  
  let totalBooksSold = 0;
  filteredOrders.forEach(o => {
    const items = getOrderItems(o);
    items.forEach(item => {
      totalBooksSold += getItemQty(item);
    });
  });

  // 3. NHÓM DỮ LIỆU ĐỂ VẼ BIỂU ĐỒ
  const chartDataMap = {};
  filteredOrders.forEach(o => {
    const dateString = getOrderDate(o);
    const utcDate = typeof dateString === 'string' && !dateString.endsWith('Z') ? `${dateString}Z` : dateString;
    const date = new Date(utcDate);
    
    if (!isNaN(date.getTime())) {
      const key = timeRange === '30days' 
        ? `${date.getDate()}/${date.getMonth() + 1}` 
        : `T${date.getMonth() + 1}/${date.getFullYear()}`;
        
      chartDataMap[key] = (chartDataMap[key] || 0) + getOrderTotal(o);
    }
  });

  const chartData = Object.keys(chartDataMap).map(key => ({
    label: key,
    value: chartDataMap[key]
  }));
  
  if (timeRange === '30days') chartData.reverse(); 

  const maxChartValue = Math.max(...chartData.map(d => d.value), 100000);

  // ================= XỬ LÝ XUẤT FILE EXCEL =================
  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      alert("Chưa có dữ liệu để xuất báo cáo!");
      return;
    }

    // 1. Chuyển đổi dữ liệu đơn hàng thành định dạng bảng Excel
    const excelData = filteredOrders.slice().sort((a,b) => {
      const dateA = new Date(getOrderDate(a));
      const dateB = new Date(getOrderDate(b));
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    }).map((o, index) => {
      const totalItems = getOrderItems(o).reduce((sum, item) => sum + getItemQty(item), 0);
      const dateString = getOrderDate(o);
      const utcDate = typeof dateString === 'string' && !dateString.endsWith('Z') ? `${dateString}Z` : dateString;
      const displayDate = isNaN(new Date(utcDate).getTime()) ? new Date().toLocaleString('vi-VN') : new Date(utcDate).toLocaleString('vi-VN');

      return {
        "STT": index + 1,
        "Mã Đơn Hàng": getOrderId(o),
        "Ngày Hoàn Tất": displayDate,
        "Tên Khách Hàng": getCustomerName(o),
        "Số Lượng Sách": totalItems,
        "Tổng Tiền (VNĐ)": getOrderTotal(o)
      };
    });

    // 2. Thêm dòng tổng kết ở cuối file Excel
    excelData.push({
      "STT": "",
      "Mã Đơn Hàng": "",
      "Ngày Hoàn Tất": "",
      "Tên Khách Hàng": "TỔNG CỘNG:",
      "Số Lượng Sách": totalBooksSold,
      "Tổng Tiền (VNĐ)": totalRevenue
    });

    // 3. Tạo Worksheet và Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Tự động căn chỉnh độ rộng cột cho đẹp
    const wscols = [
      { wch: 5 },  // STT
      { wch: 20 }, // Mã đơn
      { wch: 22 }, // Ngày
      { wch: 30 }, // Khách
      { wch: 15 }, // Số lượng
      { wch: 20 }  // Tiền
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoDoanhThu");

    // 4. Sinh file và tải về
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    // Tạo tên file theo bộ lọc
    const timeLabel = timeRange === '30days' ? '30Ngay' : timeRange === 'year' ? 'NamNay' : 'ToanThoiGian';
    saveAs(dataBlob, `BaoCao_DoanhThu_${timeLabel}.xlsx`);
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#666', textAlign: 'center', fontSize: '16px' }}>Đang tổng hợp dữ liệu báo cáo...</div>;
  }

  return (
    <div style={{ padding: '25px', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      
     {/* ================= HEADER & BỘ LỌC ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChartBar color="#1abc9c" /> Báo cáo doanh thu & Thống kê
          </h2>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>Phân tích hiệu quả kinh doanh dựa trên các đơn hàng đã giao thành công.</p>
        </div>
        
        {/* KHỐI NÚT ĐÃ ĐƯỢC CÂN BẰNG */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* 1. Khối chọn thời gian */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', 
            padding: '0 16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            height: '40px', boxSizing: 'border-box' // Cố định chiều cao 40px
          }}>
            <FaFilter color="#888" size={13} />
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>Thời gian:</span>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ border: 'none', outline: 'none', fontWeight: 'bold', color: '#1abc9c', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '14px' }}
            >
              <option value="30days">30 Ngày gần nhất</option>
              <option value="year">Trong năm nay</option>
              <option value="all">Toàn thời gian</option>
            </select>
          </div>

          {/* 2. Nút Xuất Excel */}
          <button 
            onClick={handleExportExcel}
            style={{ 
              backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '0 18px', 
              borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', 
              fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 6px rgba(39, 174, 96, 0.3)',
              transition: '0.2s', height: '40px', boxSizing: 'border-box', // Cố định chiều cao 40px cho bằng khối bên trái
              whiteSpace: 'nowrap', width: 'fit-content' // Ép không cho nút tự kéo giãn dài ra
            }}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, { backgroundColor: '#219a52', transform: 'translateY(-2px)' })}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, { backgroundColor: '#27ae60', transform: 'translateY(0)' })}
          >
            <FaFileExcel size={15} /> Xuất Excel
          </button>
          
        </div>
      </div>

      {/* ================= 4 THẺ CHỈ SỐ KPI ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', borderLeft: '4px solid #1abc9c' }}>
          <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>TỔNG DOANH THU</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#16a085', fontSize: '22px' }}>{totalRevenue.toLocaleString('vi-VN')} đ</h3>
            <FaDollarSign size={24} color="#a3e4d7" />
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', borderLeft: '4px solid #3498db' }}>
          <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>SỐ ĐƠN HOÀN TẤT</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#2980b9', fontSize: '22px' }}>{totalOrdersCount} đơn</h3>
            <FaFileInvoiceDollar size={24} color="#aed6f1" />
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', borderLeft: '4px solid #9b59b6' }}>
          <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>SỐ SÁCH ĐƯỢC ĐẶT</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#8e44ad', fontSize: '22px' }}>{totalBooksSold} cuốn</h3>
            <FaBook size={24} color="#d2b4de" />
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', borderLeft: '4px solid #f39c12' }}>
          <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px', fontWeight: 'bold' }}>TRUNG BÌNH / ĐƠN</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#d35400', fontSize: '22px' }}>{Math.round(avgOrderValue).toLocaleString('vi-VN')} đ</h3>
            <FaChartBar size={24} color="#f9e79f" />
          </div>
        </div>
      </div>

      {/* ================= BIỂU ĐỒ DOANH THU ================= */}
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCalendarAlt color="#3498db" /> Biểu đồ tăng trưởng doanh thu
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '250px', gap: '15px', paddingBottom: '10px', borderBottom: '2px solid #ecf0f1', overflowX: 'auto' }}>
          {chartData.length > 0 ? chartData.map((item, idx) => {
            const heightPercent = Math.max((item.value / maxChartValue) * 100, 2); 
            return (
              <div key={idx} style={{ flex: '1', minWidth: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                <span style={{ fontSize: '11px', color: '#7f8c8d', marginBottom: '5px' }}>
                  {(item.value / 1000).toLocaleString()}k
                </span>
                <div style={{ 
                  width: '100%', maxWidth: '35px', height: `${heightPercent}%`, 
                  backgroundColor: '#1abc9c', borderRadius: '4px 4px 0 0', 
                  transition: 'height 0.4s ease, background 0.2s' 
                }} />
                <span style={{ fontSize: '11px', color: '#34495e', marginTop: '10px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                  {item.label}
                </span>
              </div>
            );
          }) : (
            <div style={{ width: '100%', textAlign: 'center', color: '#95a5a6', alignSelf: 'center' }}>
              Không có dữ liệu doanh thu trong khoảng thời gian này.
            </div>
          )}
        </div>
      </div>

      {/* ================= BẢNG SAO KÊ CHI TIẾT ================= */}
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '16px' }}>📋 Sao kê đơn hàng thành công ({filteredOrders.length} đơn)</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #ecf0f1' }}>
                <th style={{ padding: '12px' }}>Mã đơn</th>
                <th style={{ padding: '12px' }}>Ngày hoàn tất</th>
                <th style={{ padding: '12px' }}>Khách hàng</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Số SP</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? filteredOrders.slice().sort((a,b) => {
                const dateA = new Date(getOrderDate(a));
                const dateB = new Date(getOrderDate(b));
                return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
              }).map(o => {
                const totalItems = getOrderItems(o).reduce((sum, item) => sum + getItemQty(item), 0);
                const customerName = getCustomerName(o);
                const orderId = getOrderId(o);
                const totalAmount = getOrderTotal(o);
                
                const dateString = getOrderDate(o);
                const utcDate = typeof dateString === 'string' && !dateString.endsWith('Z') ? `${dateString}Z` : dateString;
                const displayDate = isNaN(new Date(utcDate).getTime()) ? new Date().toLocaleString('vi-VN') : new Date(utcDate).toLocaleString('vi-VN');

                return (
                  <tr key={orderId} style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#34495e' }}>#{orderId}</td>
                    <td style={{ padding: '12px', color: '#666' }}>{displayDate}</td>
                    <td style={{ padding: '12px', color: '#2c3e50' }}>{customerName}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#555' }}>{totalItems}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#16a085', fontWeight: 'bold' }}>
                      {totalAmount.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ padding: '25px', textAlign: 'center', color: '#7f8c8d' }}>
                    Chưa phát sinh doanh thu trong kỳ này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}