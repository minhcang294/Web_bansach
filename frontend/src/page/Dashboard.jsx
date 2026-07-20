import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [newOrders, setNewOrders] = useState(0);
  const [lowStockBooks, setLowStockBooks] = useState(0);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchDashboardData();
  }, []);

const fetchDashboardData = async () => {
    try {
      // 1. Xử lý Đơn hàng
      const orderRes = await fetch('http://localhost:5000/api/orders/all', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (orderRes.ok) {
        const orders = await orderRes.json();
        if (Array.isArray(orders)) {
          // Kiểm tra kỹ status, có thể là 'ChoXuLy' hoặc 'ChoXuLy' (viết thường/hoa)
          const pendingOrders = orders.filter(order => order.status === 'ChoXuLy');
          setNewOrders(pendingOrders.length);
        }
      }

      // 2. Xử lý Sách (Đã thêm log để debug)
      const bookRes = await fetch('http://localhost:5000/api/books'); 
      
      if (bookRes.ok) {
        const booksData = await bookRes.json();
        
        // Log dữ liệu để xem cấu trúc thực tế trong Console (F12)
        console.log("Dữ liệu sách nhận được từ API:", booksData);
        
        const booksArray = Array.isArray(booksData) ? booksData : (booksData.items || booksData.books || []);
        
        // Quan trọng: Sử dụng đúng tên trường mà BookManagement đang dùng: soLuongTon
        const lowStock = booksArray.filter(book => {
          // Lấy giá trị tồn kho theo các cách đặt tên phổ biến trong dự án của bạn
          const stock = book.stockQuantity ?? book.soLuongTon ?? book.stock ?? 0;
          return stock < 5;
        });
        
        setLowStockBooks(lowStock.length);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Tổng quan hệ thống</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        Chào mừng bạn đến với khu vực quản trị cửa hàng sách.
      </p>
      
      <div style={{ display: 'flex', gap: '25px' }}>
        <div style={{ padding: '25px', backgroundColor: 'white', borderRadius: '10px', flex: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '6px solid #3498db' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#34495e', fontSize: '18px' }}>Đơn hàng chờ xử lý</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#3498db', margin: 0 }}>{newOrders}</p>
        </div>
        
        <div style={{ padding: '25px', backgroundColor: 'white', borderRadius: '10px', flex: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '6px solid #e74c3c' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#34495e', fontSize: '18px' }}>Sách sắp hết (&lt; 5 quyển)</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#e74c3c', margin: 0 }}>{lowStockBooks}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;