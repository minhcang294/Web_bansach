import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaListAlt } from "react-icons/fa";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState("");

  // State Modal Thêm/Sửa
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", slug: "", description: "", parentId: "" });

  const getToken = () => localStorage.getItem("token") || localStorage.getItem("accessToken");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ id: "", name: "", slug: "", description: "", parentId: "" });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setFormData({
      id: cat.id || cat.maDanhMuc || cat.MADANHMUC || "",
      name: cat.name || cat.tenDanhMuc || cat.TENDANHMUC || "",
      slug: cat.slug || cat.SLUG || "",
      description: cat.description || cat.moTa || cat.MOTA || "",
      parentId: cat.parentId || cat.parentID || cat.PARENTID || "" 
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    const catId = formData.id;
    const catName = formData.name;

    if (!catId || !catName) {
      alert("Vui lòng nhập Mã danh mục và Tên danh mục!");
      return;
    }

    // ĐÃ FIX: Ép chuỗi rỗng thành null để SQL Server hiểu đây là danh mục gốc
    const dataToSend = {
      ...formData,
      parentId: formData.parentId === "" ? null : formData.parentId
    };

    try {
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories/${catId}` 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`;
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(dataToSend) // Gửi dataToSend đã được xử lý
      });

      if (res.ok) {
        alert(isEditing ? "Cập nhật danh mục thành công!" : "Thêm danh mục mới thành công!");
        setShowModal(false);
        fetchCategories();
      } else {
        const errText = await res.text();
        console.error("Lỗi từ server:", errText);
        alert("Lưu danh mục thất bại. Vui lòng kiểm tra lại!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục mã: ${id} không?`)) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${getToken()}` }
        });

        if (res.ok) {
          alert("Xóa danh mục thành công!");
          fetchCategories();
        } else {
          alert("Xóa thất bại! Danh mục này có thể đang chứa sách liên quan.");
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  // Lọc danh mục theo từ khóa
  const filteredCategories = categories.filter((cat) => {
    const name = cat.name || cat.tenDanhMuc || cat.TENDANHMUC || "";
    const id = cat.id || cat.maDanhMuc || cat.MADANHMUC || "";
    return name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
           id.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  return (
    <div style={{ padding: "20px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#333", margin: 0, display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
          <FaListAlt color="#e71a22" /> Quản lý Danh mục
        </h2>
        <button 
          onClick={handleOpenAdd}
          style={{ 
            backgroundColor: "#28a745", color: "white", border: "none", padding: "10px 20px", 
            borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600",
            width: "fit-content", whiteSpace: "nowrap", margin: 0
          }}
        >
          <FaPlus /> Thêm danh mục
        </button>
      </div>

      {/* THANH TÌM KIẾM */}
      <div style={{ backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <div style={{ display: "flex", width: "100%", maxWidth: "400px", position: "relative" }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã hoặc tên danh mục..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: "100%", padding: "10px 15px 10px 35px", borderRadius: "5px", border: "1px solid #ddd", outline: "none" }}
          />
          <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "#888" }} />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: "#f4f6f8", color: "#555", borderBottom: "2px solid #eee" }}>
            <tr>
              <th style={{ padding: "15px", width: "10%" }}>Mã DM</th>
              <th style={{ padding: "15px", width: "20%" }}>Tên Danh Mục</th>
              <th style={{ padding: "15px", width: "20%" }}>Thuộc Nhóm</th>
              <th style={{ padding: "15px", width: "20%" }}>Slug</th>
              <th style={{ padding: "15px", width: "15%" }}>Mô Tả</th>
              <th style={{ padding: "15px", width: "15%", textAlign: "center" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#888" }}>Đang tải dữ liệu...</td></tr>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((cat, index) => {
                const catId = cat.id || cat.maDanhMuc || cat.MADANHMUC;
                const catName = cat.name || cat.tenDanhMuc || cat.TENDANHMUC;
                const catSlug = cat.slug || cat.SLUG || "";
                const catDesc = cat.description || cat.moTa || cat.MOTA || "Chưa có mô tả";
                
                // Hiển thị tên danh mục cha
                const parentId = cat.parentId || cat.parentID || cat.PARENTID;
                const parentObj = categories.find(c => (c.id || c.maDanhMuc || c.MADANHMUC) === parentId);
                const parentName = parentObj ? (parentObj.name || parentObj.tenDanhMuc || parentObj.TENDANHMUC) : (parentId ? parentId : "--- (Gốc) ---");

                return (
                  <tr key={catId} style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "white" : "#fcfcfc" }}>
                    <td style={{ padding: "15px", fontWeight: "600", color: "#333" }}>{catId}</td>
                    <td style={{ padding: "15px", color: parentId ? "#333" : "#e71a22", fontWeight: parentId ? "500" : "bold" }}>
                      {parentId ? `↳ ${catName}` : `📁 ${catName}`}
                    </td>
                    <td style={{ padding: "15px", color: "#555", fontSize: "14px" }}>{parentName}</td>
                    <td style={{ padding: "15px", color: "#666" }}>{catSlug}</td>
                    <td style={{ padding: "15px", color: "#666" }}>{catDesc}</td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <button 
                        onClick={() => handleOpenEdit(cat)}
                        title="Sửa"
                        style={{ backgroundColor: "#ffc107", color: "#000", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer", marginRight: "8px", width: "auto" }}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(catId)}
                        title="Xóa"
                        style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "8px", borderRadius: "4px", cursor: "pointer", width: "auto" }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#888" }}>
                  Không tìm thấy danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA DANH MỤC */}
      {showModal && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 
        }}>
          <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", width: "100%", maxWidth: "500px", boxSizing: "border-box", maxHeight: "90vh", overflowY: "auto" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#333", fontSize: "20px" }}>
                {isEditing ? "Chỉnh sửa Danh mục" : "Thêm Danh mục mới"}
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#888", padding: 0, width: "auto" }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "13px", color: "#333" }}>Mã Danh Mục *</label>
                <input 
                  type="text" 
                  value={formData.id}
                  disabled={isEditing}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  placeholder="VD: DM01..."
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", outline: "none", backgroundColor: isEditing ? "#f0f0f0" : "white", color: "#333", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "13px", color: "#333" }}>Tên Danh Mục *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="VD: Tiểu Thuyết..."
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", outline: "none", color: "#333", boxSizing: "border-box" }}
                />
              </div>

              {/* BỔ SUNG DROPDOWN CHỌN DANH MỤC CHA */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "13px", color: "#333" }}>Thuộc Nhóm (Danh mục cha)</label>
                <select 
                  value={formData.parentId}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", outline: "none", color: "#333", boxSizing: "border-box", backgroundColor: "white" }}
                >
                  <option value="">-- Là danh mục lớn (Gốc) --</option>
                  {categories
                    // Lọc để không tự chọn chính nó làm cha
                    .filter(c => (c.id || c.maDanhMuc || c.MADANHMUC) !== formData.id) 
                    .map(c => {
                      const cId = c.id || c.maDanhMuc || c.MADANHMUC;
                      const cName = c.name || c.tenDanhMuc || c.TENDANHMUC;
                      return (
                        <option key={cId} value={cId}>
                          {cName} ({cId})
                        </option>
                      );
                    })}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "13px", color: "#333" }}>Slug (Đường dẫn chuẩn SEO)</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="VD: tieu-thuyet..."
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", outline: "none", color: "#333", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "13px", color: "#333" }}>Mô tả ngắn</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Nhập mô tả..."
                  rows="3"
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", outline: "none", color: "#333", boxSizing: "border-box", resize: "vertical" }}
                ></textarea>
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
                onClick={handleSaveCategory}
                style={{ padding: "10px 20px", borderRadius: "4px", border: "none", backgroundColor: "#e71a22", color: "white", cursor: "pointer", fontWeight: "600", width: "auto" }}
              >
                {isEditing ? "Cập nhật" : "Lưu danh mục"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}