import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";

export default function BookCard({ book }) {
  if (!book) return null;

  // Hỗ trợ đọc dữ liệu linh hoạt (kể cả khi API trả về MASACH hay id)
  const id = book.MASACH || book.id;
  const title = book.TENSACH || book.title;
  
  // 👉 ĐÃ SỬA: Thay thế via.placeholder bằng ảnh cục bộ /default-book.png
  const image = book.ANHSACH || book.imageUrl || "/default-book.png";
  
  const price = book.GIABAN || book.price || 0;
  
  // Lấy ra số lượng tồn kho (quét nhiều trường hợp tên biến từ backend C#)
  const stock = book?.stockQuantity ?? book?.soLuongTon ?? book?.soluongTon ?? book?.SOLUONGTON ?? book?.stock ?? 0;

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
          // 👉 ĐÃ SỬA: Nếu ảnh thật lỗi hoặc không tồn tại, tự động chuyển về ảnh cục bộ
          onError={(e) => { e.target.onerror = null; e.target.src = "/default-book.png"; }}
        />
      </div>

      <div className="book-info">
        <h3 className="book-title">{title}</h3>
        
        {/* ================= BẮT ĐẦU PHẦN TỒN KHO ================= */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginTop: '6px',
          marginBottom: '10px',
          fontSize: '13px'
        }}>
          <span style={{ color: '#7f8c8d', marginRight: '5px' }}>Còn lại:</span>
          {stock > 0 ? (
            <span style={{ 
              backgroundColor: stock < 5 ? '#fdedec' : '#eafaf1', 
              color: stock < 5 ? '#e74c3c' : '#27ae60', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontWeight: 'bold',
              fontSize: '11px'
            }}>
              {stock} cuốn
            </span>
          ) : (
            <span style={{ 
              backgroundColor: '#f2f4f4', 
              color: '#95a5a6', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontWeight: 'bold',
              fontSize: '11px'
            }}>
              Hết hàng
            </span>
          )}
        </div>
        {/* ================= KẾT THÚC PHẦN TỒN KHO ================= */}
        
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