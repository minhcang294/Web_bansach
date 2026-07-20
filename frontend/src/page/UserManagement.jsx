import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        console.error("Lỗi tải người dùng, Status:", response.status);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ID: ${userId} không?`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json' 
          }
        });
        
        if (response.ok) {
          alert('Xóa thành công!');
          fetchUsers(); // Load lại danh sách sau khi xóa
        } else {
          alert('Xóa thất bại! Vui lòng kiểm tra quyền truy cập.');
        }
      } catch (error) {
        console.error("Lỗi:", error);
        alert('Có lỗi xảy ra khi xóa.');
      }
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Quản lý Người dùng</h2>
      
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f8', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Họ Tên</th>
              <th style={{ padding: '15px' }}>Email</th>
              <th style={{ padding: '15px' }}>Vai trò (Role)</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>{user.id}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{user.fullName || user.tenKhachHang || 'Chưa cập nhật'}</td>
                  <td style={{ padding: '15px' }}>{user.email}</td>
                  <td style={{ padding: '15px' }}>
                     <span style={{ 
                        padding: '5px 10px', 
                        borderRadius: '15px', 
                        backgroundColor: user.role === 'Admin' ? '#fdeced' : '#e1f5fe', 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        color: user.role === 'Admin' ? '#e74c3c' : '#0288d1' 
                      }}>
                      {user.role || 'User'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>
                  Không tìm thấy dữ liệu người dùng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;