import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { bookApi } from "../api/bookApi.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// ⚠️ QUAN TRỌNG: Hãy đảm bảo đường dẫn này trỏ đúng tới file CSS bạn vừa dán code ở Bước 1
// Ví dụ: import "../theme.css"; 

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    bookApi.getById(id)
      .then((res) => { setBook(res.data); setQty(1); })
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    const res = await addToCart(book.id, qty);
    setMsg(res.success 
      ? { type: "success", text: "Đã thêm vào giỏ hàng!" } 
      : { type: "error", text: res.message });
  };

  if (loading) return <div className="container page-wrap" style={{ padding: "40px 0" }}><p>Đang tải...</p></div>;
  if (!book) return <div className="container page-wrap" style={{ padding: "40px 0" }}>Không tìm thấy sách.</div>;

  return (
    <div className="container page-wrap" style={{ padding: "40px 0" }}>
      <Link to="/books" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#999", marginBottom: 20 }}>
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>

      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        
        {/* Cột Trái: Ảnh */}
        <div style={{ flex: "0 0 300px" }}>
          <img 
            src={book.imageUrl} 
            alt={book.title} 
            style={{ width: "100%", borderRadius: 12, boxShadow: "0 5px 15px rgba(0,0,0,0.1)", objectFit: "cover" }} 
          />
        </div>
        
        {/* Cột Phải: Thông tin */}
        <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ fontSize: 28, marginBottom: 10, color: "#222" }}>{book.title}</h1>
          <p style={{ marginBottom: 15, fontSize: 16, color: "#555" }}>
            Tác giả: <strong style={{ color: "#333" }}>{book.author}</strong>
          </p>
          <p style={{ fontSize: 32, fontWeight: 700, color: "#d91c24", marginBottom: 20 }}>
            {formatCurrency(book.price)}
          </p>
          <p style={{ marginBottom: 30, lineHeight: 1.7, color: "#666" }}>
            {book.description}
          </p>

          {/* KHU VỰC NÚT BẤM CĂN NGANG */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            
            {/* Component: Tăng giảm số lượng */}
            <div className="qty-control-custom">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} type="button">
                <Minus size={18} />
              </button>
              <span className="qty-value-custom">{qty}</span>
              <button onClick={() => setQty(q => Math.min(book.stockQuantity, q + 1))} type="button">
                <Plus size={18} />
              </button>
            </div>
            
            {/* Component: Thêm vào giỏ */}
            <button className="btn-add-cart-custom" onClick={handleAdd} disabled={cartLoading}>
              <ShoppingCart size={20} /> Thêm vào giỏ
            </button>

          </div>

          {/* Hiển thị thông báo */}
          {msg.text && (
            <p style={{ 
              marginTop: 20, 
              padding: "10px 15px", 
              borderRadius: "6px", 
              fontWeight: "600",
              backgroundColor: msg.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: msg.type === 'success' ? '#2e7d32' : '#c62828',
              width: "fit-content"
            }}>
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}