import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaTrash, FaEdit, FaLock, FaUnlock, FaPlus, FaTimes, FaUserShield, FaUserSlash, FaSpinner } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Các state hỗ trợ tìm kiếm và lọc
  const [searchKeyword, setSearchKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Các state cho Modal Thêm/Sửa
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    id: "", 
    fullName: "", 
    email: "", 
    password: "", 
    role: "User", 
    status: 1 
  });

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/users`, {
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        alert("Phiên đăng nhập hết hạn hoặc bạn không đủ quyền Admin. Vui lòng đăng nhập lại!");
        localStorage.clear();
        window.location.href = '/login'; 
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data || data.$values || []);
        setUsers(list);
      } else {
        console.error("Lỗi tải người dùng, Status:", response.status);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      setLoading(false);
    }
  };

  // CHUẨN HÓA DỮ LIỆU
  const normalizedUsers = useMemo(() => {
    return users.map(u => ({
      id: u.id || u.Id || u.maKhachHang || u.maNhanVien || "",
      fullName: u.fullName || u.FullName || u.tenKhachHang || u.tenNV || 'Chưa cập nhật',
      email: u.email || u.Email || "",
      role: u.role || u.Role || "User",
      status: u.status !== undefined ? u.status : (u.Status !== undefined ? u.Status : 1)
    }));
  }, [users]);

  // LOGIC LỌC
  const filteredUsers = normalizedUsers.filter((user) => {
    const name = user.fullName.toLowerCase();
    const email = user.email.toLowerCase();
    const matchesSearch = name.includes(searchKeyword.toLowerCase()) || email.includes(searchKeyword.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async (userId) => {
    if (window.confirm(`⚠️ Nguy hiểm: Bạn có chắc chắn muốn XÓA VĨNH VIỄN người dùng này?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/users/${userId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json' 
          }
        });
        
        if (response.ok) {
          alert('✅ Đã xóa thành công!');
          fetchUsers();
        } else {
          const err = await response.json().catch(() => ({}));
          alert('❌ Xóa thất bại: ' + (err.message || 'Vui lòng kiểm tra lại quyền truy cập.'));
        }
      } catch (error) {
        alert('❌ Có lỗi xảy ra khi kết nối máy chủ.');
      }
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 1 ? 0 : 1;
    const actionText = newStatus === 0 ? "KHÓA" : "MỞ KHÓA";
    
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của [${user.fullName}]?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/users/${user.id}/status`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json' 
          }
        });
        
        if (response.ok) {
          fetchUsers(); 
        } else {
          // Fallback
          const updateRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: user.fullName, FullName: user.fullName,
              email: user.email, Email: user.email,
              role: user.role, Role: user.role,
              status: newStatus, Status: newStatus
            })
          });
          if (updateRes.ok) fetchUsers();
          else alert(`❌ Không thể ${actionText} tài khoản lúc này.`);
        }
      } catch (error) {
        alert("❌ Lỗi kết nối máy chủ!");
      }
    }
  };

  const handleOpenAdd = () => {
    setFormData({ id: "", fullName: "", email: "", password: "", role: "User", status: 1 });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      password: "", 
      role: user.role,
      status: user.status
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    if (!formData.fullName || !formData.email) {
      alert("⚠️ Vui lòng nhập đầy đủ Họ tên và Email!");
      return;
    }
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      alert("⚠️ Mật khẩu phải có ít nhất 6 ký tự khi tạo tài khoản mới!");
      return;
    }

    const url = isEditing ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/users/${formData.id}` : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/users`;
    const method = isEditing ? 'PUT' : 'POST';

    const payload = isEditing ? {
      fullName: formData.fullName, FullName: formData.fullName,
      email: formData.email, Email: formData.email,
      role: formData.role, Role: formData.role,
      status: formData.status, Status: formData.status
    } : {
      fullName: formData.fullName, FullName: formData.fullName,
      email: formData.email, Email: formData.email,
      password: formData.password, Password: formData.password,
      role: formData.role, Role: formData.role,
      status: formData.status, Status: formData.status
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(isEditing ? "✅ Cập nhật thành công!" : "✅ Thêm mới thành công!");
        setShowModal(false);
        fetchUsers(); 
      } else {
        const errData = await response.json().catch(() => ({}));
        alert("❌ Lưu thất bại: " + (errData.message || "Kiểm tra lại dữ liệu."));
      }
    } catch (error) {
      alert("❌ Đã xảy ra lỗi khi kết nối với máy chủ.");
    }
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "#f3f4f6", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER TỔNG QUAN (ĐÃ SỬA NÚT) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h2 style={{ color: "#111827", margin: 0, fontSize: "26px", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px", letterSpacing: "-0.5px" }}>
            <div style={{ padding: "8px", backgroundColor: "#fee2e2", borderRadius: "10px", display: "flex" }}>
              <FaUserShield color="#ef4444" size={22} />
            </div>
            Quản lý Người dùng
          </h2>
          <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Quản lý và phân quyền tài khoản trên toàn hệ thống.</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          style={{ 
            backgroundColor: "#10b981", 
            color: "white", 
            border: "none", 
            padding: "12px 20px", 
            borderRadius: "10px", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            fontWeight: "600", 
            fontSize: "14px", 
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)", 
            transition: "all 0.2s ease",
            width: "fit-content",       // Giúp nút co gọn lại theo nội dung chữ
            whiteSpace: "nowrap",       // Ngăn không cho chữ bị rớt dòng
            marginLeft: "auto"          // Đẩy nút sát sang bên phải
          }}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, { transform: "translateY(-2px)", boxShadow: "0 6px 16px rgba(16, 185, 129, 0.35)" })}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, { transform: "translateY(0)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)" })}
        >
          <FaPlus size={14} /> Thêm tài khoản mới
        </button>
      </div>

      {/* BỘ LỌC & TÌM KIẾM */}
      <div style={{ display: "flex", gap: "15px", backgroundColor: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "25px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", flex: 1, minWidth: "280px", position: "relative" }}>
          <input 
            type="text" 
            placeholder="Nhập tên hoặc email để tìm kiếm..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: "10px", border: "1px solid #e5e7eb", outline: "none", fontSize: "14px", backgroundColor: "#f9fafb", transition: "border 0.2s" }}
            onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
            onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"}
          />
          <FaSearch style={{ position: "absolute", left: "16px", top: "15px", color: "#9ca3af", fontSize: "15px" }} />
        </div>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: "12px 16px", borderRadius: "10px", border: "1px solid #e5e7eb", outline: "none", minWidth: "180px", fontSize: "14px", backgroundColor: "#f9fafb", color: "#374151", cursor: "pointer", fontWeight: "500" }}
        >
          <option value="All">Tất cả vai trò</option>
          <option value="Admin">🛡️ Quản trị viên</option>
          <option value="Staff">💼 Nhân viên</option>
          <option value="User">👤 Khách hàng</option>
        </select>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
        <div style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "850px" }}>
            <thead style={{ backgroundColor: "#f9fafb", position: "sticky", top: 0, zIndex: 1, borderBottom: "2px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase" }}>ID</th>
                <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase" }}>Họ Tên</th>
                <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase" }}>Email</th>
                <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase" }}>Vai trò</th>
                <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", textAlign: "center" }}>Trạng thái</th>
                <th style={{ padding: "16px 20px", fontSize: "13px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
                    <FaSpinner className="fa-spin" size={30} style={{ marginBottom: "15px", color: "#3b82f6" }} />
                    <br/>Đang tải dữ liệu hệ thống...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={{ padding: "16px 20px", color: "#9ca3af", fontSize: "13px", fontWeight: "500" }}>#{user.id.substring(0,8)}...</td>
                    <td style={{ padding: "16px 20px", fontWeight: "700", color: "#111827", fontSize: "14px" }}>{user.fullName}</td>
                    <td style={{ padding: "16px 20px", color: "#4b5563", fontSize: "14px" }}>{user.email}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ 
                        padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", display: "inline-block",
                        backgroundColor: user.role === 'Admin' ? '#fee2e2' : user.role === 'Staff' ? '#fef3c7' : '#e0f2fe', 
                        color: user.role === 'Admin' ? '#dc2626' : user.role === 'Staff' ? '#d97706' : '#0284c7' 
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                       <span style={{ 
                          padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", display: "inline-block",
                          backgroundColor: user.status === 0 ? '#fee2e2' : '#dcfce7', 
                          color: user.status === 0 ? '#dc2626' : '#16a34a' 
                        }}>
                          {user.status === 0 ? "Khóa" : "Hoạt động"}
                       </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button onClick={() => handleOpenEdit(user)} title="Chỉnh sửa" style={{ backgroundColor: "#f3f4f6", color: "#4b5563", border: "none", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#e5e7eb"; e.currentTarget.style.color = "#111827" }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; e.currentTarget.style.color = "#4b5563" }}>
                          <FaEdit size={15} />
                        </button>
                        <button onClick={() => handleToggleStatus(user)} title={user.status === 0 ? "Mở khóa tài khoản" : "Khóa tài khoản"} style={{ backgroundColor: user.status === 0 ? "#ecfdf5" : "#fff7ed", color: user.status === 0 ? "#10b981" : "#f97316", border: "none", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.filter = "brightness(0.95)"} onMouseOut={(e) => e.currentTarget.style.filter = "none"}>
                          {user.status === 0 ? <FaUnlock size={15} /> : <FaLock size={15} />}
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} title="Xóa vĩnh viễn" style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "none", width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#fee2e2"; e.currentTarget.style.color = "#dc2626" }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444" }}>
                          <FaTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                    <FaUserSlash size={40} style={{ marginBottom: "15px", opacity: 0.5 }} />
                    <br/><span style={{ fontSize: "15px", fontWeight: "500" }}>Không tìm thấy người dùng nào.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM / SỬA USER */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(17, 24, 39, 0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", opacity: 1, transition: "opacity 0.3s ease" }}>
          
          <div style={{ position: "relative", backgroundColor: "white", padding: "35px", borderRadius: "20px", width: "100%", maxWidth: "500px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", transform: "scale(1)", transition: "transform 0.3s ease" }}>
            
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "#f3f4f6", border: "none", color: "#6b7280", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", cursor: "pointer", transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }} onMouseOut={(e) => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#6b7280"; }}>
              <FaTimes />
            </button>

            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ margin: 0, color: "#111827", fontSize: "24px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
                {isEditing ? <FaEdit color="#3b82f6" /> : <FaPlus color="#10b981" />}
                {isEditing ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
              </h3>
              <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Điền thông tin chi tiết của người dùng bên dưới.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>Họ và Tên</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid #d1d5db", outline: "none", fontSize: "14px", backgroundColor: "#f9fafb", transition: "border 0.2s" }} onFocus={(e) => e.target.style.border = "1px solid #3b82f6"} onBlur={(e) => e.target.style.border = "1px solid #d1d5db"} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>Địa chỉ Email</label>
                <input type="email" value={formData.email} disabled={isEditing} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@domain.com" style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid #d1d5db", outline: "none", fontSize: "14px", backgroundColor: isEditing ? "#f3f4f6" : "#f9fafb", color: isEditing ? "#9ca3af" : "#111827", cursor: isEditing ? "not-allowed" : "text" }} onFocus={(e) => !isEditing && (e.target.style.border = "1px solid #3b82f6")} onBlur={(e) => !isEditing && (e.target.style.border = "1px solid #d1d5db")} />
              </div>

              {!isEditing && (
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>Mật khẩu tạm thời</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Tối thiểu 6 ký tự..." style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid #d1d5db", outline: "none", fontSize: "14px", backgroundColor: "#f9fafb", transition: "border 0.2s" }} onFocus={(e) => e.target.style.border = "1px solid #3b82f6"} onBlur={(e) => e.target.style.border = "1px solid #d1d5db"} />
                </div>
              )}

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>Phân quyền hệ thống</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid #d1d5db", outline: "none", fontSize: "14px", backgroundColor: "#f9fafb", cursor: "pointer", fontWeight: "500" }}>
                  <option value="User">Khách hàng (User)</option>
                  <option value="Staff">Nhân viên (Staff)</option>
                  <option value="Admin">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "35px" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "10px", border: "none", backgroundColor: "#f3f4f6", color: "#4b5563", cursor: "pointer", fontWeight: "600", fontSize: "14px", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e5e7eb"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}>
                Hủy bỏ
              </button>
              <button onClick={handleSaveUser} style={{ padding: "12px 24px", borderRadius: "10px", border: "none", backgroundColor: "#3b82f6", color: "white", cursor: "pointer", fontWeight: "600", fontSize: "14px", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}>
                {isEditing ? "Lưu cập nhật" : "Xác nhận tạo"}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;