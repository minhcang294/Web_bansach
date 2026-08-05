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
    <Link to={`/books/${id}`} className="book-card-container">
      
      {/* ================= CSS RESPONSIVE CHO THẺ SÁCH ================= */}
      <style>{`
        .book-card-container {
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          height: 100%; /* Đảm bảo các thẻ trên cùng 1 hàng cao bằng nhau */
        }
        .book-card-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border-color: #e71a22;
        }

        /* KHUNG ẢNH CỐ ĐỊNH TỶ LỆ */
        .book-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3; /* Tỷ lệ vàng cho bìa sách (Ngang 2, Cao 3) */
          background-color: #f9f9f9;
          overflow: hidden;
        }
        .book-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover; /* Hình ảnh không bao giờ bị bóp méo */
          transition: transform 0.3s ease;
        }
        .book-card-container:hover .book-image {
          transform: scale(1.05); /* Zoom nhẹ ảnh khi hover */
        }

        /* BADGE GIẢM GIÁ */
        .discount-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: #e71a22;
          color: white;
          font-weight: bold;
          font-size: 13px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          z-index: 2;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        /* THÔNG TIN SÁCH */
        .book-info {
          padding: 12px;
          display: flex;
          flex-direction: column;
          flex: 1; /* Đẩy giá tiền xuống đáy nếu tên sách ngắn */
        }

        /* TÊN SÁCH (CHỐNG TRÀN CHỮ) */
        .book-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin: 0 0 8px 0;
          line-height: 1.4;
          /* Magic CSS: Giới hạn tối đa 2 dòng, dài quá hiện dấu ... */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* TỒN KHO */
        .book-stock {
          display: flex; align-items: center; 
          margin-bottom: 10px; font-size: 12px;
        }
        .stock-label { color: #7f8c8d; margin-right: 5px; }
        .stock-badge {
          padding: 2px 8px; border-radius: 12px; 
          font-weight: bold; font-size: 11px;
        }
        .stock-in { background-color: #eafaf1; color: #27ae60; }
        .stock-low { background-color: #fdedec; color: #e74c3c; }
        .stock-out { background-color: #f2f4f4; color: #95a5a6; }

        /* GIÁ TIỀN */
        .book-price-wrapper {
          display: flex;
          flex-direction: column; /* Đổi thành column nếu muốn giá cũ nằm dưới, hoặc row để nằm ngang */
          margin-top: auto; /* Luôn đẩy cụm giá xuống dưới cùng của thẻ */
        }
        .book-price {
          color: #e71a22;
          font-size: 16px;
          font-weight: bold;
        }
        .old-price {
          color: #999;
          font-size: 13px;
          text-decoration: line-through;
          margin-top: 2px;
        }

        /* ================= MOBILE RESPONSIVE ================= */
        @media (max-width: 768px) {
          .book-info { padding: 8px; }
          .discount-badge { width: 30px; height: 30px; font-size: 11px; top: 5px; right: 5px; }
          .book-title { font-size: 13px; margin-bottom: 5px; }
          .book-stock { font-size: 11px; margin-bottom: 8px; }
          .stock-badge { padding: 2px 6px; font-size: 10px; }
          .book-price { font-size: 14px; }
          .old-price { font-size: 12px; }
        }
      `}</style>

      <div className="book-image-wrapper">
        {/* Badge giảm giá */}
        {discount > 0 && (
          <div className="discount-badge">
            -{discount}%
          </div>
        )}

        <img
          src={image}
          alt={title}
          className="book-image"
          onError={(e) => { e.target.onerror = null; e.target.src = "/default-book.png"; }}
        />
      </div>

      <div className="book-info">
        <h3 className="book-title" title={title}>{title}</h3>
        
        {/* ================= BẮT ĐẦU PHẦN TỒN KHO ================= */}
        <div className="book-stock">
          <span className="stock-label">Còn lại:</span>
          {stock > 0 ? (
            <span className={`stock-badge ${stock < 5 ? 'stock-low' : 'stock-in'}`}>
              {stock} cuốn
            </span>
          ) : (
            <span className="stock-badge stock-out">
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