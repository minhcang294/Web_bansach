import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaEdit, FaLock, FaUnlock, FaPlus, FaTimes, FaUserShield } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Các state hỗ trợ tìm kiếm và lọc
  const [searchKeyword, setSearchKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Các state cho Modal Thêm/Sửa
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", fullName: "", email: "", role: "User", status: 1 });

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
    if (window.confirm(`Bạn có chắc chắn muốn XÓA người dùng ID: ${userId} không? Hành động này không thể hoàn tác.`)) {
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
          fetchUsers();
        } else {
          alert('Xóa thất bại! Vui lòng kiểm tra quyền truy cập.');
        }
      } catch (error) {
        console.error("Lỗi:", error);
        alert('Có lỗi xảy ra khi xóa.');
      }
    }
  };

  // Các hàm xử lý Modal
  const handleOpenAdd = () => {
    setFormData({ id: "", fullName: "", email: "", role: "User", status: 1 });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({
      id: user.id,
      fullName: user.fullName || user.tenKhachHang || "",
      email: user.email || "",
      role: user.role || "User",
      status: user.status !== undefined ? user.status : 1
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Logic Lọc & Tìm kiếm
  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.fullName || user.tenKhachHang || "").toLowerCase().includes(searchKeyword.toLowerCase()) || 
                          (user.email || "").toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesRole = roleFilter === "All" || (user.role || "User") === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ padding: "20px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER: Tiêu đề & Nút thêm mới */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "nowrap" }}>
        
        {/* Khối tiêu đề (Ép không xuống dòng) */}
        <h2 style={{ color: "#333", margin: 0, display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
          <FaUserShield color="#e71a22" /> Quản lý Người dùng
        </h2>

        {/* Khối nút Thêm mới (Ép kích thước ôm vừa chữ, không bị giãn to) */}
        <button 
          onClick={handleOpenAdd}
          style={{ 
            backgroundColor: "#28a745", color: "white", border: "none", padding: "10px 20px", 
            borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600",
            width: "fit-content", // Ép kích thước vừa phải
            whiteSpace: "nowrap", // Không cho chữ rớt dòng
            margin: 0
          }}
        >
          <FaPlus /> Thêm người dùng
        </button>
      </div>

      {/* THANH CÔNG CỤ: Tìm kiếm & Lọc */}
      <div style={{ display: "flex", gap: "15px", backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <div style={{ display: "flex", flex: 1, maxWidth: "400px", position: "relative" }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo Tên hoặc Email..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: "100%", padding: "10px 15px 10px 35px", borderRadius: "5px", border: "1px solid #ddd", outline: "none" }}
          />
          <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "#888" }} />
        </div>
        
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ddd", outline: "none", minWidth: "150px" }}
        >
          <option value="All">Tất cả vai trò</option>
          <option value="Admin">Admin (Quản trị)</option>
          <option value="Staff">Staff (Nhân viên)</option>
          <option value="User">User (Khách hàng)</option>
        </select>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#f4f6f8", color: "#555", borderBottom: "2px solid #eee" }}>
            <tr>
              <th style={{ padding: "15px" }}>ID</th>
              <th style={{ padding: "15px" }}>Họ Tên</th>
              <th style={{ padding: "15px" }}>Email</th>
              <th style={{ padding: "15px" }}>Vai trò</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Trạng thái</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#888" }}>Đang tải dữ liệu...</td></tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "white" : "#fcfcfc" }}>
                  <td style={{ padding: "15px", color: "#555", fontSize: "14px" }}>{user.id}</td>
                  <td style={{ padding: "15px", fontWeight: "600", color: "#333" }}>{user.fullName || user.tenKhachHang || 'Chưa cập nhật'}</td>
                  <td style={{ padding: "15px", color: "#555" }}>{user.email}</td>
                  
                  {/* Cột Vai trò */}
                  <td style={{ padding: "15px" }}>
                    <span style={{ 
                      padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", display: "inline-block",
                      backgroundColor: user.role === 'Admin' ? '#fdeced' : user.role === 'Staff' ? '#fff3e0' : '#e1f5fe', 
                      color: user.role === 'Admin' ? '#e74c3c' : user.role === 'Staff' ? '#e67e22' : '#0288d1' 
                    }}>
                      {user.role || 'User'}
                    </span>
                  </td>
                  
                  {/* Cột Trạng thái */}
                  <td style={{ padding: "15px", textAlign: "center" }}>
                     <span style={{ 
                        padding: "5px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", display: "inline-block",
                        backgroundColor: user.status === 0 ? '#ffeeeb' : '#e6f4ea', 
                        color: user.status === 0 ? '#d93025' : '#137333' 
                      }}>
                        {user.status === 0 ? "Đã khóa" : "Hoạt động"}
                      </span>
                  </td>

                  {/* Cột Thao tác */}
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <button 
                      onClick={() => handleOpenEdit(user)}
                      title="Chỉnh sửa"
                      style={{ backgroundColor: "#ffc107", color: "#000", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer", marginRight: "8px", width: "auto" }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      title={user.status === 0 ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                      style={{ backgroundColor: user.status === 0 ? "#28a745" : "#fd7e14", color: "white", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer", marginRight: "8px", width: "auto" }}
                    >
                      {user.status === 0 ? <FaUnlock /> : <FaLock />}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      title="Xóa vĩnh viễn"
                      style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer", width: "auto" }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>
                  Không tìm thấy dữ liệu người dùng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA USER (Đã fix lỗi lệch Tiêu đề và Dấu X) */}
      {showModal && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 
        }}>
          <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", width: "100%", maxWidth: "500px", boxSizing: "border-box" }}>
            
            {/* KHU VỰC TIÊU ĐỀ & DẤU X (Ép nằm 2 bên trái phải) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "25px" }}>
              <h3 style={{ margin: 0, color: "#333", fontSize: "22px" }}>
                {isEditing ? "Chỉnh sửa Người dùng" : "Thêm Người dùng mới"}
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: "transparent", border: "none", fontSize: "22px", cursor: "pointer", color: "#888", padding: 0, width: "auto", margin: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px", color: "#333" }}>Họ và Tên</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Nhập họ tên..." style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", outline: "none", color: "#333", boxSizing: "border-box" }} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px", color: "#333" }}>Email</label>
                <input type="email" value={formData.email} disabled={isEditing} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Nhập email..." style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", outline: "none", backgroundColor: isEditing ? "#f0f0f0" : "white", color: "#333", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "14px", color: "#333" }}>Vai trò (Role)</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", outline: "none", color: "#333", boxSizing: "border-box" }}>
                  <option value="User">Khách hàng (User)</option>
                  <option value="Staff">Nhân viên (Staff)</option>
                  <option value="Admin">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "25px" }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ padding: "10px 20px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "white", color: "#333", cursor: "pointer", fontWeight: "500", width: "auto" }}
              >
                Hủy bỏ
              </button>
              
              <button 
                style={{ padding: "10px 20px", borderRadius: "4px", border: "none", backgroundColor: "#e71a22", color: "white", cursor: "pointer", fontWeight: "600", width: "auto" }}
              >
                {isEditing ? "Lưu thay đổi" : "Tạo tài khoản"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;