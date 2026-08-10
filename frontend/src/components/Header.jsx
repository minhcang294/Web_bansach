import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaClipboardList, FaBars, FaCog, FaUserTie, FaFire, FaHome, FaChevronDown } from "react-icons/fa"; 
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    if (logout) logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchKeyword.trim() !== "") {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  return (
    <header style={{ backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 999, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
      <style>{`
        /* ================= CÁC KHỐI CHUNG ================= */
        .kd-topbar { background-color: #f5f5f5; border-bottom: 1px solid #ebebeb; padding: 8px 0; font-size: 13px; }
        
        .topbar-admin-link { transition: all 0.2s; }
        .topbar-admin-link:hover { color: #3498db !important; opacity: 0.7; }
        
        /* ================= THANH MENU ĐỎ CHÍNH ================= */
        .kd-navbar-red { background-color: #e71a22; color: #fff; }
        .nav-red-container { display: flex; align-items: center; gap: 30px; }

        .kd-dropdown { position: relative; }
        .btn-category-toggle {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          background-color: #cc151e; padding: 12px 20px; color: #fff;
          font-weight: 700; font-size: 15px; text-transform: uppercase; transition: background 0.2s;
        }
        .btn-category-toggle:hover { background-color: #b31219; }

        .nav-links-red { display: flex; gap: 25px; align-items: center; }
        .nav-links-red a {
          color: #fff; text-decoration: none; font-weight: 600; font-size: 15px;
          display: flex; align-items: center; gap: 6px; transition: opacity 0.2s;
        }
        .nav-links-red a:hover { opacity: 0.8; }

        /* ================= MEGA MENU NỘI DUNG ================= */
        .kd-dropdown-content {
          display: none; position: absolute; background-color: #fff;
          width: 850px; box-shadow: 0px 8px 25px rgba(0,0,0,0.15);
          z-index: 1000; top: 100%; left: 0; 
          border-radius: 0 0 8px 8px; padding: 30px;
          border: 1px solid #eee; border-top: none;
        }
        .kd-dropdown:hover .kd-dropdown-content, .kd-dropdown-content.show { display: block; animation: fadeIn 0.15s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .mega-menu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
        .mega-category { display: flex; flex-direction: column; margin-bottom: 25px; }
        .mega-category h4 {
          font-size: 15px; color: #e71a22; margin: 0 0 12px 0; text-transform: uppercase;
          font-weight: 700; border-bottom: 2px solid #f0f0f0; padding-bottom: 6px;
        }
        .mega-category a {
          color: #555 !important; padding: 6px 0 !important; text-decoration: none;
          display: block; font-weight: 500 !important; font-size: 13.5px; transition: all 0.2s;
        }
        .mega-category a:hover { color: #e71a22 !important; transform: translateX(5px); }
        .highlight-item { color: #e71a22 !important; font-weight: 600 !important; }

        /* ================= GHI ĐÈ CSS CHO TABLET VÀ ĐIỆN THOẠI ================= */
        @media (max-width: 992px) {
          .kd-dropdown-content { width: 100% !important; padding: 20px !important; left: 0; }
          .mega-menu-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .nav-links-red { display: none !important; } 
          .nav-red-container { gap: 0 !important; }
        }

        @media (max-width: 768px) {
          .topbar-container { flex-direction: column !important; align-items: center !important; gap: 8px !important; }
          .topbar-greeting { display: none !important; }

          /* Đã đổi tên class thành kd-main-header, kd-logo-wrapper... để chống xung đột Admin CSS */
          .kd-main-header { flex-direction: column !important; padding: 12px 0 !important; gap: 15px !important; }
          .kd-logo-wrapper, .kd-search-box-container, .kd-actions-box { 
            flex: unset !important; width: 100% !important; justify-content: center !important; 
          }
          
          .kd-search-box-container > div { max-width: 100% !important; }
          
          .kd-actions-box { gap: 40px !important; }
          .action-text { display: none !important; } 
          .cart-icon-wrapper { position: relative; }
          .cart-badge {
            position: absolute; top: -8px; right: -12px; background: #e71a22; color: #fff;
            font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 20px; border: 2px solid #fff;
            display: block !important;
          }

          .btn-category-toggle { justify-content: center !important; }
          .mega-menu-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .kd-dropdown-content { max-height: 60vh !important; overflow-y: auto !important; padding: 15px !important; }
        }
      `}</style>

      {/* ================= 1. TOPBAR ================= */}
      <div className="kd-topbar">
        <div className="container topbar-container" style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
          
          <div className="topbar-greeting" style={{ fontWeight: "500", display: "flex", alignItems: "center" }}>
            <span>Chào mừng bạn đến với <strong style={{ color: "#e71a22", letterSpacing: "0.5px" }}>BookGalaxy</strong></span>
          </div>
          
          <div className="kd-user-links">
            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{ fontWeight: "600", color: "#333" }}>Xin chào, {user?.fullName || "Người dùng"}</span>
                {user?.role === "Admin" && (
                  <><span style={{ color: "#ccc" }}>|</span><Link to="/admin" className="topbar-admin-link" style={{ color: "#3498db", fontWeight: "700", textDecoration: "none" }}><FaCog /> Quản trị</Link></>
                )}
                {user?.role === "Staff" && (
                  <><span style={{ color: "#ccc" }}>|</span><Link to="/staff" style={{ color: "#e74c3c", fontWeight: "700", textDecoration: "none" }}><FaUserTie /> Nhân viên</Link></>
                )}
                <span style={{ color: "#ccc" }}>|</span>
                <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "#e74c3c", fontWeight: "700", cursor: "pointer", padding: 0 }}>Đăng xuất</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px", fontWeight: "500" }}>
                <Link to="/login" style={{ color: "#555", textDecoration: "none" }}>Đăng nhập</Link>
                <span style={{ color: "#ccc" }}>|</span>
                <Link to="/register" style={{ color: "#555", textDecoration: "none" }}>Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN HEADER ================= */}
      <div className="container kd-main-header" style={{ display: "flex", alignItems: "center", padding: "20px 0" }}>
        
        {/* KHỐI 1: LOGO */}
        <div className="kd-logo-wrapper" style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase" }}>
              <span style={{ color: "#333" }}>BOOK</span>
              <span style={{ color: "#e71a22" }}>Galaxy</span>
            </span>
          </Link>
        </div>

        {/* KHỐI 2: Ô TÌM KIẾM */}
        <div className="kd-search-box-container" style={{ flex: 2, display: "flex", justifyContent: "center" }}>
          <div 
            style={{ 
              display: "flex", flexDirection: "row", width: "100%", maxWidth: "600px", 
              height: "44px", borderRadius: "6px", border: "2px solid #e71a22", 
              overflow: "hidden", backgroundColor: "#fff" 
            }}
          >
            <input 
              type="text" 
              placeholder="Tìm kiếm tựa sách, tác giả..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
              style={{ flex: 1, padding: "0 15px", border: "none", outline: "none", fontSize: "14px", height: "100%" }}
            />
            <button 
              type="button" 
              onClick={handleSearch}
              title="Tìm kiếm"
              style={{ 
                width: "50px", height: "100%", backgroundColor: "transparent", color: "#e71a22", 
                border: "none", cursor: "pointer", fontSize: "18px", display: "flex", 
                alignItems: "center", justifyContent: "center", padding: 0, margin: 0
              }}
            >
              <FaSearch />
            </button>
          </div>
        </div>

        {/* KHỐI 3: ACTIONS */}
        <div className="kd-actions-box" style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "25px" }}>
          <Link to="/orders" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#333" }}>
            <FaClipboardList size={26} color="#666" />
            <div className="action-text" style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", color: "#777", fontWeight: "normal", lineHeight: 1 }}>Theo dõi</span>
              <span style={{ fontSize: "14px", fontWeight: "600", lineHeight: 1.2 }}>Đơn hàng</span>
            </div>
          </Link>
          
          <Link to="/cart" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#333" }}>
            <div className="cart-icon-wrapper">
              <FaShoppingCart size={26} color="#666" />
              <span className="cart-badge" style={{ display: "none" }}>{cart?.totalQuantity || 0}</span>
            </div>
            <div className="action-text" style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", color: "#777", fontWeight: "normal", lineHeight: 1 }}>Giỏ hàng</span>
              <span style={{ fontSize: "14px", fontWeight: "700", lineHeight: 1.2, color: "#e71a22" }}>{cart?.totalQuantity || 0} sản phẩm</span>
            </div>
          </Link>
        </div>

      </div>

      {/* ================= 3. THANH MENU NAVBAR ĐỎ ================= */}
      <nav className="kd-navbar-red">
        <div className="container nav-red-container">
          
          {/* NÚT MEGA MENU DANH MỤC */}
          <div className="kd-dropdown" onMouseLeave={() => setIsMenuOpen(false)}>
            <div className="btn-category-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <FaBars size={18} />
              <span>Danh Mục Sách</span>
              <FaChevronDown size={14} style={{ marginLeft: "4px" }} />
            </div>
            
            {/* KHUNG NỘI DUNG MEGA MENU */}
            <div className={`kd-dropdown-content ${isMenuOpen ? "show" : ""}`}>
              <div className="mega-menu-grid">
                <div>
                  <div className="mega-category">
                    <h4>📚 Văn Học</h4>
                    <Link to="/books?category=tieu-thuyet">Tiểu Thuyết</Link>
                    <Link to="/books?category=truyen-ngan">Truyện Ngắn - Tản Văn</Link>
                    <Link to="/books?category=light-novel">Light Novel</Link>
                    <Link to="/books?category=ngon-tinh">Ngôn Tình</Link>
                  </div>
                  <div className="mega-category">
                    <h4>🧠 Kỹ Năng</h4>
                    <Link to="/books?category=ky-nang-song">Kỹ Năng Sống</Link>
                    <Link to="/books?category=ren-luyen">Rèn Luyện Nhân Cách</Link>
                    <Link to="/books?category=tam-ly">Tâm Lý</Link>
                    <Link to="/books?category=tuoi-moi-lon">Sách Cho Tuổi Mới Lớn</Link>
                  </div>
                </div>

                <div>
                  <div className="mega-category">
                    <h4>💰 Kinh Tế</h4>
                    <Link to="/books?category=nhan-vat">Nhân Vật - Bài Học Kinh Doanh</Link>
                    <Link to="/books?category=quan-tri">Quản Trị - Lãnh Đạo</Link>
                    <Link to="/books?category=marketing">Marketing - Bán Hàng</Link>
                    <Link to="/books?category=phan-tich">Phân Tích Kinh Tế</Link>
                  </div>
                  <div className="mega-category">
                    <h4>👶 Thiếu Nhi</h4>
                    <Link to="/books?category=manga">Manga - Comic</Link>
                    <Link to="/books?category=kien-thuc">Kiến Thức Bách Khoa</Link>
                    <Link to="/books?category=sach-tranh">Sách Tranh Kỹ Năng Sống</Link>
                    <Link to="/books?category=vua-hoc">Vừa Học - Vừa Chơi</Link>
                  </div>
                </div>

                <div>
                  <div className="mega-category">
                    <h4>🌍 Ngoại Ngữ</h4>
                    <Link to="/books?category=tieng-anh">Tiếng Anh</Link>
                    <Link to="/books?category=tieng-nhat">Tiếng Nhật</Link>
                    <Link to="/books?category=tieng-hoa">Tiếng Hoa</Link>
                    <Link to="/books?category=tieng-han">Tiếng Hàn</Link>
                  </div>
                  <div className="mega-category">
                    <h4>⭐ Nổi Bật</h4>
                    <Link to="/books?type=sach-moi" className="highlight-item">Sách Mới ♥</Link>
                    <Link to="/books?type=manga-moi" className="highlight-item">Manga Mới ♥</Link>
                    <Link to="/books?type=light-novel-moi" className="highlight-item">Light Novel Mới ♥</Link>
                    <Link to="/books?type=ban-chay" className="highlight-item">Sách Bán Chạy ♥</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CÁC LINK ĐIỀU HƯỚNG TRÊN THANH ĐỎ */}
          <div className="nav-links-red">
            <Link to="/"><FaHome size={16} /> Trang Chủ</Link>
            <Link to="/books?type=sale"><FaFire size={16} color="#ffda00" /> Khuyến Mãi HOT</Link>
            <Link to="/about">
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2ecc71', borderRadius: '50%', padding: '2px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              </span>
              Giới thiệu BookGalaxy
            </Link>
          </div>

        </div>
      </nav>
      
    </header>
  );
}