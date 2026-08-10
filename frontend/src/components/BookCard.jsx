import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check } from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function BookCard({ book }) {
  const { addToCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const res = await addToCart(book.id, 1);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <img src={book.imageUrl} alt={book.title} className="book-card-img" loading="lazy" />
      <div className="book-card-body">
        <span className="book-card-cat">{book.categoryName}</span>
        <h3 className="book-card-title">{book.title}</h3>
        <span className="book-card-author">{book.author}</span>
        <div className="book-card-footer">
          <span className="book-card-price">{formatCurrency(book.price)}</span>
          {book.stockQuantity > 0 ? (
            <button className="add-cart-btn" onClick={handleAdd} disabled={loading} aria-label="Thêm vào giỏ">
              {justAdded ? <Check size={16} /> : <ShoppingCart size={15} />}
            </button>
          ) : (
            <span className="stock-out">Hết hàng</span>
          )}
        </div>
      </div>
    </Link>
  );
}
