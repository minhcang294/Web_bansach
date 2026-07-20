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
     {/* ================= HERO ================= */}
      {/* ĐÃ SỬA: Đổi margin-top thành 0 để dính sát vào menu đỏ */}
      <section style={{ margin: "0 0 50px 0" }}>
        <div className="container">
          
          {/* BANNER TỰ ĐỘNG CHUYỂN */}
          <div 
            style={{ 
              display: "grid", 
              position: "relative", 
              overflow: "hidden", 
              borderRadius: "0 0 12px 12px", // Chỉ bo góc dưới, góc trên vuông vức dính vào menu
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
                  objectFit: "contain", 
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
          {["Thiếu nhi", "Manga", "Văn học", "Kinh tế", "Ngoại ngữ", "Kỹ năng", "Tâm lý", "Lịch sử"].map((item) => (
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
      <section className="promo-banner">
        <div className="container">
          <img 
            src="/promo.jpg" 
            alt="Khuyến mãi" 
            style={{ width: "100%", height: "auto" }} 
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