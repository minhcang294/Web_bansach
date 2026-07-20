import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";

export default function BookCard({ book }) {
  if (!book) return null;

  // Hỗ trợ đọc dữ liệu linh hoạt (kể cả khi API trả về MASACH hay id)
  const id = book.MASACH || book.id;
  const title = book.TENSACH || book.title;
  const image = book.ANHSACH || book.imageUrl || "https://via.placeholder.com/200x300?text=Chua+co+anh";
  const price = book.GIABAN || book.price || 0;
  
  // Giả lập giảm giá 10% nếu trong CSDL chưa có cột discount
  const discount = book.discount || 10; 
  const originalPrice = book.originalPrice || Math.round(price / (1 - discount / 100));

  return (
    <Link to={`/books/${id}`} className="book-card">
      <div className="book-image-wrapper">
        
        {/* Badge giảm giá kiểu Kim Đồng (Hình tròn đỏ góc phải) */}
        {discount > 0 && (
          <div className="discount-badge">
            -{discount}%
          </div>
        )}

        <img
          src={image}
          alt={title}
          className="book-image"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x300?text=Loi+Anh" }}
        />
      </div>

      <div className="book-info">
        <h3 className="book-title">{title}</h3>
        
        <div className="book-price-wrapper">
          <span className="book-price">{formatCurrency(price)}</span>
          {discount > 0 && (
            <span className="old-price">{formatCurrency(originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}