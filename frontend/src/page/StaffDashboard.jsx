import React, { useState, useEffect } from 'react';
import { 
    FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle, 
    FaExclamationTriangle, FaUserPlus, FaCalendarDay, FaSyncAlt, 
    FaBell, FaSearch, FaEllipsisV, FaFilter, FaChartLine 
} from 'react-icons/fa';

const StaffDashboard = () => {
    // 14 & 15: State cho thời gian cập nhật và hiệu ứng Refresh
    const [lastUpdated, setLastUpdated] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        updateTime();
    }, []);

    const updateTime = () => {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        setLastUpdated(timeString);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            updateTime();
            setIsRefreshing(false);
        }, 1000); // Giả lập call API mất 1 giây
    };

    // Dữ liệu mẫu - Tất cả thanh toán đều là Trực tiếp
    const recentOrders = [
        { id: 'HD0000001', customer: 'Nguyễn Trương Minh Sang', address: 'TP.HCM', qty: 3, total: '144.000 đ', payment: 'Thanh toán trực tiếp', status: 'Chờ Xử Lý' },
        { id: 'HD0000002', customer: 'Trần Văn A', address: 'Hà Nội', qty: 1, total: '250.000 đ', payment: 'Thanh toán trực tiếp', status: 'Đang Giao' },
        { id: 'HD0000003', customer: 'Lê Thị B', address: 'Đà Nẵng', qty: 5, total: '89.000 đ', payment: 'Thanh toán trực tiếp', status: 'Hoàn Tất' },
        { id: 'HD0000004', customer: 'Phạm C', address: 'Cần Thơ', qty: 2, total: '120.000 đ', payment: 'Thanh toán trực tiếp', status: 'Đã Hủy' },
    ];

    // Dữ liệu mẫu cho Sách và Khách hàng
    const topBooks = [
        { name: 'Đắc Nhân Tâm', qty: 120 },
        { name: 'Doraemon Vol.1', qty: 95 },
        { name: 'One Piece', qty: 80 },
        { name: 'Nhà Giả Kim', qty: 65 },
        { name: 'Sherlock Holmes', qty: 42 },
    ];

    const newCustomers = [
        { name: 'Nguyễn Văn A', info: 'Đã mua 2 đơn', time: 'Hôm nay' },
        { name: 'Trần Thị B', info: 'Khách hàng mới', time: 'Hôm qua' },
    ];

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f6f9', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            
            {/* HEADER & THÔNG BÁO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    BẢNG ĐIỀU KHIỂN NHÂN VIÊN
                </h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <FaBell size={24} color="#555" />
                        <span style={{ position: 'absolute', top: '-5px', right: '-8px', backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>5</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#777' }}>
                        Cập nhật lúc: <strong>{lastUpdated}</strong>
                    </div>
                    <button onClick={handleRefresh} style={{ ...actionBtn, backgroundColor: '#3498db', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaSyncAlt className={isRefreshing ? "spin-animation" : ""} /> Refresh
                    </button>
                </div>
            </div>

            {/* THỐNG KÊ NHANH (Đã bỏ thẻ Doanh thu) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <StatCard icon={<FaBoxOpen size={30} color="#f39c12"/>} title="Chờ xử lý" value="12" />
                <StatCard icon={<FaTruck size={30} color="#3498db"/>} title="Đang giao" value="5" />
                <StatCard icon={<FaCheckCircle size={30} color="#2ecc71"/>} title="Hoàn tất" value="128" />
                <StatCard icon={<FaCalendarDay size={30} color="#e67e22"/>} title="Đơn hôm nay" value="35" />
                <StatCard icon={<FaExclamationTriangle size={30} color="#e74c3c"/>} title="Sách sắp hết" value="12" alert />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* CỘT TRÁI: BỘ LỌC, DANH SÁCH ĐƠN HÀNG & BIỂU ĐỒ */}
                <div>
                    {/* BỘ LỌC ĐƠN HÀNG */}
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input type="text" placeholder="Tìm mã đơn, SĐT..." style={inputStyle} />
                        <select style={inputStyle}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="Chờ Xử Lý">🟡 Chờ xử lý</option>
                            <option value="Đang Giao">🔵 Đang giao</option>
                            <option value="Hoàn Tất">🟢 Hoàn tất</option>
                            <option value="Đã Hủy">🔴 Đã hủy</option>
                        </select>
                        <input type="date" style={inputStyle} />
                        <input type="date" style={inputStyle} />
                        <button style={{ ...actionBtn, backgroundColor: '#2c3e50', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}><FaFilter/> Lọc</button>
                    </div>

                    {/* DANH SÁCH ĐƠN HÀNG MỚI NHẤT */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '15px', marginBottom: '20px', overflowX: 'auto' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Đơn hàng mới nhất</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#666' }}>
                                    <th style={thStyle}>Mã ĐH</th>
                                    <th style={thStyle}>Khách hàng</th>
                                    <th style={thStyle}>Địa chỉ</th>
                                    <th style={thStyle}>SL</th>
                                    <th style={thStyle}>Tổng tiền</th>
                                    <th style={thStyle}>Thanh toán</th>
                                    <th style={thStyle}>Trạng thái</th>
                                    <th style={thStyle}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f1f1' }}>
                                        <td style={tdStyle}><strong>{order.id}</strong></td>
                                        <td style={tdStyle}>{order.customer}</td>
                                        <td style={tdStyle}>{order.address}</td>
                                        <td style={tdStyle}>{order.qty}</td>
                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#e74c3c' }}>{order.total}</td>
                                        <td style={tdStyle}>{order.payment}</td>
                                        <td style={tdStyle}>
                                            <span style={getStatusBadge(order.status)}>{order.status}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                {order.status === 'Chờ Xử Lý' && <button style={{...miniBtn, backgroundColor: '#3498db'}}>Duyệt</button>}
                                                {order.status === 'Đang Giao' && <button style={{...miniBtn, backgroundColor: '#2ecc71'}}>Hoàn tất</button>}
                                                <button style={{...miniBtn, backgroundColor: '#95a5a6'}}>Xem</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* BIỂU ĐỒ ĐƠN HÀNG 7 NGÀY (Chuyển từ biểu đồ doanh thu sang đơn hàng) */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
                        <h3 style={{ marginTop: 0, color: '#333' }}><FaChartLine color="#3498db" /> Số lượng đơn hàng 7 ngày qua</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '150px', paddingTop: '20px', borderBottom: '1px solid #ccc' }}>
                            {[15, 28, 12, 35, 20, 42, 50].map((h, i) => (
                                <div key={i} style={{ flex: 1, backgroundColor: '#3498db', height: `${h * 2}%`, borderRadius: '4px 4px 0 0', position: 'relative', transition: 'height 0.3s' }}>
                                    <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: '#555', fontWeight: 'bold' }}>{h}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#666' }}>
                            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: TOP SÁCH & KHÁCH MỚI */}
                <div>
                    {/* TOP SÁCH BÁN CHẠY */}
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Top 5 sách bán chạy</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {topBooks.map((book, idx) => (
                                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed #eee' }}>
                                    <span><strong>{idx + 1}.</strong> {book.name}</span>
                                    <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{book.qty} cuốn</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* KHÁCH HÀNG MỚI */}
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaUserPlus color="#2ecc71"/> Khách hàng mới</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {newCustomers.map((cus, idx) => (
                                <li key={idx} style={{ padding: '10px 0', borderBottom: '1px dashed #eee' }}>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>{cus.name} <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal' }}>({cus.time})</span></div>
                                    <div style={{ fontSize: '13px', color: '#666', marginTop: '3px' }}>{cus.info}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
            
            {/* CSS Animation cho nút Refresh */}
            <style>{`
                .spin-animation { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// Component thẻ thống kê nhỏ
const StatCard = ({ icon, title, value, sub, alert }) => (
    <div style={{ backgroundColor: alert ? '#fadbd8' : '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div>{icon}</div>
        <div>
            <div style={{ fontSize: '13px', color: alert ? '#c0392b' : '#777', fontWeight: 'bold', textTransform: 'uppercase' }}>{title}</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333', margin: '3px 0' }}>{value}</div>
            {sub && <div style={{ fontSize: '12px', color: '#27ae60', fontWeight: 'bold' }}>{sub}</div>}
        </div>
    </div>
);

// Trả về màu sắc Badge theo trạng thái
const getStatusBadge = (status) => {
    let color = '', bg = '';
    switch (status) {
        case 'Chờ Xử Lý': color = '#d35400'; bg = '#fdebd0'; break; // Vàng 🟡
        case 'Đang Giao': color = '#2980b9'; bg = '#d6eaf8'; break; // Xanh dương 🔵
        case 'Hoàn Tất': color = '#27ae60'; bg = '#d5f5e3'; break; // Xanh lá 🟢
        case 'Đã Hủy': color = '#c0392b'; bg = '#fadbd8'; break; // Đỏ 🔴
        default: color = '#333'; bg = '#eee';
    }
    return { backgroundColor: bg, color: color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' };
};

// CSS Inline Styles
const inputStyle = { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', outline: 'none' };
const actionBtn = { padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' };
const miniBtn = { padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: 'white', fontWeight: 'bold' };
const thStyle = { padding: '10px', backgroundColor: '#f8f9fa' };
const tdStyle = { padding: '10px' };

export default StaffDashboard;