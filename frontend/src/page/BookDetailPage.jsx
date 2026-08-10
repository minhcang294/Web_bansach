import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { bookApi } from "../api/bookApi.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

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
    setMsg({ type: "", text: "" });
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

  if (loading) return <div className="container page-wrap"><p>Đang tải...</p></div>;
  if (!book) return <div className="container page-wrap"><div className="empty-state">Không tìm thấy sách.</div></div>;

  return (
    <div className="container page-wrap">
      <Link to="/books" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
        <ArrowLeft size={15} /> Quay lại danh sách
      </Link>

      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        <img src={book.imageUrl} alt={book.title} style={{ width: 280, borderRadius: 16, boxShadow: "0 14px 30px rgba(110,51,53,0.15)" }} />

        <div style={{ flex: "1 1 320px" }}>
          <span className="book-card-cat">{book.categoryName}</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--wine-dark)", margin: "8px 0" }}>{book.title}</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 16 }}>Tác giả: <strong style={{ color: "var(--text)" }}>{book.author}</strong></p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--wine)", margin: "0 0 20px" }}>
            {formatCurrency(book.price)}
          </p>

          <p style={{ lineHeight: 1.7, color: "var(--text)", marginBottom: 24 }}>{book.description}</p>

          {book.stockQuantity > 0 ? (
            <>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Còn {book.stockQuantity} cuốn trong kho</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                <div className="qty-control">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={13} /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(book.stockQuantity, q + 1))}><Plus size={13} /></button>
                </div>
                <button className="btn btn-primary" onClick={handleAdd} disabled={cartLoading}>
                  <ShoppingCart size={16} /> Thêm vào giỏ
                </button>
              </div>
              {msg.text && (
                <p className={msg.type === "success" ? "form-success" : "form-error"} style={{ maxWidth: 320 }}>{msg.text}</p>
              )}
            </>
          ) : (
            <p className="form-error" style={{ maxWidth: 260 }}>Sách này hiện đã hết hàng.</p>
          )}
        </div>
      </div>
    </div>
  );
}
