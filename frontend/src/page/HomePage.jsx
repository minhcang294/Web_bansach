import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShippingFast, FaMedal, FaCreditCard, FaHeadset } from "react-icons/fa";
import BookCard from "../components/BookCard";
import { bookApi } from "../api/bookApi.js"; 

export default function HomePage() {
  const [books, setBooks] = useState([]);
  
  // ================= STATE CHO SLIDER BANNER =================
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Danh sách các ảnh bạn muốn chạy slide
  const bannerImages = [
    "/banner.jpg",
    "/banner3.jpg", 
    "/banner2.jpg", 
    "/banner4.jpg"
  ];

  // Logic tự động chuyển slide mỗi 4 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer); // Dọn dẹp bộ đếm khi rời trang
  }, [bannerImages.length]);

  // ================= LẤY DỮ LIỆU SÁCH =================
  useEffect(() => {
    bookApi.getAll({ page: 1, pageSize: 20 })
      .then((res) => {
        setBooks(res.data.items || res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="home-page">
      
      {/* ================= CSS RESPONSIVE (MÁY TÍNH & ĐIỆN THOẠI) ================= */}
      <style>{`
        /* --- 1. Hiệu ứng hover Danh mục (Của bạn) --- */
        .category-item {
          transition: all 0.3s ease;
          padding: 15px;
          text-align: center;
          border: 1px solid #eee;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        .category-item:hover {
          background-color: #e71a22 !important; 
          color: #ffffff !important;            
          border-color: #e71a22 !important;     
          box-shadow: 0 4px 10px rgba(231, 26, 34, 0.2); 
        }

        /* --- 2. Tiêu đề các mục (Section Title) --- */
        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #e71a22;
          padding-bottom: 10px;
        }
        .section-title h2 { margin: 0; font-size: 22px; text-transform: uppercase; color: #333; }
        .section-title a { color: #e71a22; text-decoration: none; font-weight: 600; font-size: 14px; }

        /* --- 3. Bố cục dạng lưới (Grid) chuẩn cho Desktop --- */
        .service-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr); /* 4 cột */
          gap: 20px;
          padding: 30px 0;
        }
        .service-item {
          display: flex; align-items: center; gap: 15px; 
          padding: 15px; border: 1px solid #eee; border-radius: 8px;
        }
        .service-item svg { font-size: 30px; color: #e71a22; flex-shrink: 0; }
        .service-item h4 { margin: 0 0 5px 0; font-size: 15px; }
        .service-item p { margin: 0; font-size: 13px; color: #777; }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr); /* 4 cột */
          gap: 15px;
          margin-bottom: 40px;
        }

        .book-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr); /* 5 cuốn 1 hàng */
          gap: 20px;
          margin-bottom: 40px;
        }

        /* ================= ÉP KIỂU CHO MÁY TÍNH BẢNG (TABLET) ================= */
        @media (max-width: 992px) {
          .book-grid { grid-template-columns: repeat(3, 1fr) !important; } /* 3 cuốn/hàng */
          .category-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .service-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 15px; }
        }

        /* ================= ÉP KIỂU CHO ĐIỆN THOẠI (MOBILE) ================= */
        @media (max-width: 768px) {
          .section-title h2 { font-size: 16px; } /* Thu nhỏ chữ tiêu đề */
          .section-title a { font-size: 12px; }
          
          /* Lưới Điện thoại: 2 cột như Shopee/Tiki */
          .book-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .category-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          
          .service-grid { grid-template-columns: repeat(1, 1fr) !important; gap: 10px; padding: 20px 0; }
          .service-item { padding: 10px; }
          .service-item svg { font-size: 24px; }
          
          /* Khoảng cách các section gọn lại */
          .hero-section { margin-bottom: 20px !important; }
          .book-section { margin-bottom: 20px !important; }
        }
      `}</style>

      {/* ================= HERO ================= */}
      <section className="hero-section" style={{ margin: "0 0 40px 0" }}>
        <div className="container">
          
          {/* BANNER TỰ ĐỘNG CHUYỂN */}
          <div 
            style={{ 
              display: "grid", 
              position: "relative", 
              overflow: "hidden", 
              borderRadius: "0 0 12px 12px", 
              width: "100%",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
            }}
          >
            {bannerImages.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`Banner ${index + 1}`} 
                style={{
                  gridArea: "1 / 1", 
                  width: "100%",
                  height: "auto",    
                  objectFit: "cover", /* Đổi thành cover để banner đẹp hơn trên mọi màn hình */
                  opacity: currentSlide === index ? 1 : 0,
                  transition: "opacity 0.8s ease-in-out", 
                  zIndex: currentSlide === index ? 1 : 0
                }}
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} 
              />
            ))}

            {/* Các dấu chấm (dots) điều hướng bên dưới banner */}
            <div style={{ 
              position: "absolute", bottom: "15px", left: "50%", transform: "translateX(-50%)", 
              display: "flex", gap: "8px", zIndex: 2 
            }}>
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    width: currentSlide === index ? "30px" : "12px", 
                    height: "12px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    background: currentSlide === index ? "#e60023" : "rgba(255,255,255,0.7)",
                    transition: "all 0.3s ease",
                    padding: 0,
                    margin: 0
                  }}
                  aria-label={`Chuyển đến banner ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="service-section">
        <div className="container service-grid">
          <div className="service-item">
            <FaShippingFast />
            <div>
              <h4>Miễn phí vận chuyển</h4>
              <p>Đơn từ 250.000đ</p>
            </div>
          </div>
          <div className="service-item">
            <FaMedal />
            <div>
              <h4>Sách chính hãng</h4>
              <p>100% bản quyền</p>
            </div>
          </div>
          <div className="service-item">
            <FaCreditCard />
            <div>
              <h4>Thanh toán</h4>
              <p>An toàn & nhanh chóng</p>
            </div>
          </div>
          <div className="service-item">
            <FaHeadset />
            <div>
              <h4>Hỗ trợ 24/7</h4>
              <p>Luôn sẵn sàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY ================= */}
      <section className="container">
        <div className="section-title">
          <h2>Danh mục nổi bật</h2>
          <Link to="/books">Xem tất cả →</Link>
        </div>
        <div className="category-grid">
          {["Văn học",  "Kỹ năng",  "Kinh tế",  "Thiếu nhi",  "Manga - Comic",  "Ngoại ngữ",  "Tâm lý",  "Tiểu thuyết"].map((item) => (
            <div key={item} className="category-item">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ================= NEW BOOK ================= */}
      <section className="container book-section">
        <div className="section-title">
          <h2>Sách mới phát hành</h2>
          <Link to="/books">Xem thêm →</Link>
        </div>
        <div className="book-grid">
          {books.slice(0, 5).map((book) => (
            <BookCard key={book.MASACH || book.id} book={book} />
          ))}
        </div>
      </section>

      {/* ================= PROMOTION ================= */}
      <section className="promo-banner" style={{ marginBottom: "40px" }}>
        <div className="container">
          <img 
            src="/promo.jpg" 
            alt="Khuyến mãi" 
            style={{ width: "100%", height: "auto", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }} 
            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} 
          />
        </div>
      </section>

      {/* ================= BEST SELLER ================= */}
      <section className="container book-section">
        <div className="section-title">
          <h2>Sách bán chạy</h2>
          <Link to="/books">Xem thêm →</Link>
        </div>
        <div className="book-grid">
          {books.slice(5, 10).map((book) => (
            <BookCard key={book.MASACH || book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}