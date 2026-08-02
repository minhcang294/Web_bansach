import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaBoxOpen, FaExclamationTriangle, FaUserPlus, FaCheckDouble } from 'react-icons/fa';
import * as signalR from '@microsoft/signalr';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const connectionRef = useRef(null);

  // Hàm hỗ trợ lấy danh sách ID đã đọc từ LocalStorage
  const getReadIds = () => JSON.parse(localStorage.getItem('readNotifIds') || '[]');

  // =================================================================
  // 🌟 MẢNH GHÉP 1: TẢI LỊCH SỬ VÀ KIỂM TRA XEM ĐÃ ĐỌC CHƯA
  // =================================================================
  useEffect(() => {
    const fetchOldNotifications = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const response = await fetch("http://localhost:5000/api/ActivityLogs", {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }); 
        
        if (response.ok) {
          const data = await response.json();
          const readIds = getReadIds(); // Lấy danh sách ID đã đọc từ bộ nhớ
          
          const formattedHistory = data.slice(0, 20).map(item => {
            const notifId = (item.id || item.Id || Math.random()).toString();
            return {
              id: notifId,
              type: (item.action === 'Thêm mới' || item.Action === 'Thêm mới') ? 'order' : 'warning',
              title: item.entityType || item.EntityType || 'Hệ thống',
              message: item.details || item.Details || '',
              time: item.timestamp || item.Timestamp || item.createdAt || 'Gần đây',
              isRead: readIds.includes(notifId) // Kiểm tra xem ID này đã nằm trong danh sách đọc chưa
            };
          });

          setNotifications(formattedHistory);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử thông báo:", error);
      }
    };

    fetchOldNotifications();
  }, []);

  // =================================================================
  // 🌟 MẢNH GHÉP 2: KẾT NỐI SIGNALR NHẬN THÔNG BÁO MỚI
  // =================================================================
  useEffect(() => {
    if (connectionRef.current) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/notificationHub")
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.on("ReceiveNotification", (incomingNotif) => {
      const notifId = (incomingNotif.id || incomingNotif.Id || Date.now()).toString();
      const formattedNotif = {
        id: notifId,
        type: incomingNotif.type || incomingNotif.Type || 'order',
        title: incomingNotif.title || incomingNotif.Title || 'Có đơn hàng mới',
        message: incomingNotif.message || incomingNotif.Message || '',
        time: incomingNotif.time || incomingNotif.Time || 'Vừa xong',
        isRead: false
      };

      setNotifications(prev => [formattedNotif, ...prev]);
    });

    const startHubConnection = async () => {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
          await connection.start();
        }
      } catch (error) {
        setTimeout(startHubConnection, 3000);
      }
    };

    startHubConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =================================================================
  // 🌟 CÁC HÀM XỬ LÝ ĐÁNH DẤU "ĐÃ ĐỌC"
  // =================================================================
  
  // 1. Khi ấn "Đã đọc tất cả"
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id.toString());
    const currentReadIds = getReadIds();
    // Gộp ID cũ và mới, loại bỏ trùng lặp
    const newReadIds = [...new Set([...currentReadIds, ...allIds])]; 
    localStorage.setItem('readNotifIds', JSON.stringify(newReadIds));

    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // 2. Khi ấn vào 1 thông báo cụ thể
  const markAsRead = (id) => {
    const stringId = id.toString();
    const currentReadIds = getReadIds();
    
    // Nếu chưa đọc thì thêm vào bộ nhớ
    if (!currentReadIds.includes(stringId)) {
      currentReadIds.push(stringId);
      localStorage.setItem('readNotifIds', JSON.stringify(currentReadIds));
    }

    // Cập nhật lại giao diện ngay lập tức
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'order': return <div style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '10px', borderRadius: '50%' }}><FaBoxOpen size={16} /></div>;
      case 'warning': return <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '50%' }}><FaExclamationTriangle size={16} /></div>;
      case 'user': return <div style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '10px', borderRadius: '50%' }}><FaUserPlus size={16} /></div>;
      default: return <div style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '10px', borderRadius: '50%' }}><FaBell size={16} /></div>;
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          backgroundColor: '#f8f9fa', border: 'none', padding: '10px', 
          borderRadius: '50%', cursor: 'pointer', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', position: 'relative',
          transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
      >
        <FaBell size={18} color="#4b5563" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            backgroundColor: '#ef4444', color: 'white', fontSize: '10px',
            fontWeight: 'bold', width: '18px', height: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', border: '2px solid white'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '45px', right: '0', width: '340px',
          backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 9999, overflow: 'hidden', border: '1px solid #f3f4f6'
        }}>
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '15px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' 
          }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#111827', fontWeight: 'bold' }}>Thông báo hệ thống</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
              >
                <FaCheckDouble /> Đã đọc tất cả
              </button>
            )}
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                let displayTime = notif.time;
                try {
                  if (notif.time !== 'Vừa xong' && notif.time !== 'Gần đây') {
                    const dateObj = new Date(notif.time);
                    if (!isNaN(dateObj.getTime())) {
                      displayTime = dateObj.toLocaleString('vi-VN');
                    }
                  }
                } catch(e) {}

                return (
                  <div 
                    key={notif.id} 
                    onClick={() => markAsRead(notif.id)} // <--- THÊM SỰ KIỆN CLICK VÀO ĐÂY
                    style={{ 
                      display: 'flex', gap: '15px', padding: '15px', borderBottom: '1px solid #f3f4f6',
                      backgroundColor: notif.isRead ? 'white' : '#f0f9ff', cursor: 'pointer', transition: '0.2s'
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>{getIconForType(notif.type)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: notif.isRead ? '600' : 'bold', color: '#111827' }}>
                          {notif.title}
                        </span>
                        {!notif.isRead && <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', marginTop: '4px' }}></span>}
                      </div>
                      <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>{displayTime}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                Chưa có thông báo nào.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}