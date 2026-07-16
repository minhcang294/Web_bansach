import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ShoppingCart, BookOpen, LogOut, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const [keyword, setKeyword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/books?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-icon"><BookOpen size={18} /></span>
          <span className="brand-name">Hiệu Sách</span>
        </Link>

        <form className="search-box" onSubmit={handleSearch}>
          <Search size={16} />
          <input
            placeholder="Tìm sách, tác giả..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>

        <div className="nav-actions">
          <Link to="/cart" className="icon-btn" aria-label="Giỏ hàng">
            <ShoppingCart size={20} />
            {cart.totalQuantity > 0 && <span className="cart-badge">{cart.totalQuantity}</span>}
          </Link>

          {isAuthenticated ? (
            <div style={{ position: "relative" }}>
              <div className="user-chip" onClick={() => setMenuOpen((v) => !v)}>
                <span className="user-avatar">{user.fullName?.charAt(0).toUpperCase()}</span>
                <span>{user.fullName?.split(" ").pop()}</span>
              </div>
              {menuOpen && (
                <div
                  className="card"
                  style={{ position: "absolute", right: 0, top: 46, minWidth: 180, padding: 8, zIndex: 60 }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link to="/orders" style={menuItemStyle} onClick={() => setMenuOpen(false)}>
                    <Package size={15} /> Đơn hàng của tôi
                  </Link>
                  <button
                    style={{ ...menuItemStyle, width: "100%", border: "none", background: "none", cursor: "pointer" }}
                    onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                  >
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Đăng nhập</Link>
          )}
        </div>
      </div>
    </header>
  );
}

const menuItemStyle = {
  display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
  fontSize: 13.5, fontWeight: 600, color: "#6E3335", borderRadius: 8, textAlign: "left",
};
