import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaClipboardList, FaBars, FaCog } from "react-icons/fa"; // Đã thêm FaCog
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart(); // Lấy object cart từ CartContext
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) logout();
    navigate("/");
  };

  return (
    <header>
      {/* ================= TOPBAR ================= */}
      <div className="kd-topbar">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", color: "#333" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "500" }}>
            📞 Hotline: 1900 571595
          </div>
          
          <div className="kd-user-links">
            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                  Xin chào, {user?.fullName || "Người dùng"}
                </span>

                {/* ===== NÚT DÀNH RIÊNG CHO ADMIN ===== */}
                {user?.role === "Admin" && (
                  <>
                    <span style={{ color: "#ccc" }}>|</span>
                    <Link 
                      to="/admin" 
                      style={{
                        color: "#3498db", // Màu xanh dương để nổi bật, phân biệt với nút Đăng xuất
                        fontWeight: "700",
                        textDecoration: "none",
                        fontSize: "14px",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      <FaCog /> Quản trị
                    </Link>
                  </>
                )}
                {/* ===================================== */}

                <span style={{ color: "#ccc" }}>|</span>

                <button 
                  onClick={handleLogout}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--primary, #e74c3c)", // Ưu tiên màu đỏ
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "14px",
                    textTransform: "uppercase",
                    padding: 0
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">Đăng nhập</Link>
                <span style={{ color: "#ccc" }}>|</span>
                <Link to="/register">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
      <div className="kd-main-header container">
        <Link to="/" className="kd-logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.png" alt="Logo" style={{ height: "45px" }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
          <span>HIỆU SÁCH</span>
        </Link>

        <div className="kd-search">
          <input type="text" placeholder="Tìm kiếm tựa sách, tác giả..." />
          <button><FaSearch /></button>
        </div>

        <div className="header-actions">
          <Link to="/orders" className="kd-cart">
            <FaClipboardList />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", color: "#777", fontWeight: "normal" }}>Theo dõi</span>
              <span>Đơn hàng</span>
            </div>
          </Link>
          
          <Link to="/cart" className="kd-cart">
            <FaShoppingCart />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", color: "#777", fontWeight: "normal" }}>Giỏ hàng</span>
              <span>{cart?.totalQuantity || 0} sản phẩm</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ================= NAVBAR ================= */}
      <nav className="kd-navbar">
        <div className="container">
          <Link to="/books" style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(0,0,0,0.1)" }}>
            <FaBars /> Danh mục sách
          </Link>
          <Link to="/">Trang chủ</Link>
          <Link to="/books">Tất cả sách</Link>
          <Link to="/books?categoryId=DM04">Thiếu nhi</Link>
          <Link to="/books?categoryId=DM01">Văn học</Link>
          <Link to="/books?categoryId=DM03">Kinh tế</Link>
          <Link to="/books?categoryId=DM05">Ngoại ngữ</Link>
          <Link to="/books?categoryId=DM02">Kỹ năng sống</Link>
        </div>
      </nav>
    </header>
  );
}