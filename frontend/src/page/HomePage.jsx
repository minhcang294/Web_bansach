import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookApi } from "../api/bookApi.js";
import BookCard from "../components/BookCard.jsx";
import "../styles/theme.css"; // Bổ sung import file CSS để nhận diện các style mới

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([bookApi.getAll({ page: 1, pageSize: 8 }), bookApi.getCategories()])
      .then(([bookRes, catRes]) => {
        setBooks(bookRes.data.items);
        setCategories(catRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Banner */}
      <div style={{ background: "linear-gradient(135deg, #F3C9C6 0%, #E39691 55%, #D07E78 100%)" }}>
        <div className="container" style={{ padding: "56px 24px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, color: "#4A1F1F", margin: "0 0 12px" }}>
            Mỗi trang sách, một câu chuyện mới
          </h1>
          <p style={{ color: "#5A2727", fontSize: 15, maxWidth: 480, margin: "0 auto 24px" }}>
            Khám phá hàng ngàn đầu sách hay với ưu đãi mỗi ngày tại Hiệu Sách.
          </p>
          <Link to="/books" className="btn btn-primary">Khám phá ngay</Link>
        </div>
      </div>

      <div className="container page-wrap" style={{ marginBottom: "40px" }}>
        {/* Danh mục */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
          {categories.map((c) => (
            <Link key={c.id} to={`/books?categoryId=${c.id}`} className="btn btn-outline btn-sm">
              {c.name}
            </Link>
          ))}
        </div>

        <h2 className="section-title">Sách nổi bật</h2>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Đang tải...</p>
        ) : (
          <div className="book-grid">
            {books.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </div>

      {/* === CÁC TÍNH NĂNG DỊCH VỤ VÀ GIAO DIỆN MỚI === */}
      
      {/* Icons Section (Cam kết chất lượng) */}
      <section className="icons-container">
        <div className="icons">
          <i className="fa-solid fa-truck-fast" style={{ fontSize: '3rem', color: '#C97874', marginRight: '2rem' }}></i>
          <div className="info">
            <h3>Miễn Phí Vận Chuyển</h3>
            <span>Đơn hàng từ 300k</span>
          </div>
        </div>
        <div className="icons">
          <i className="fa-solid fa-rotate-left" style={{ fontSize: '3rem', color: '#C97874', marginRight: '2rem' }}></i>
          <div className="info">
            <h3>Đổi trả linh hoạt</h3>
            <span>Trong vòng 7 ngày</span>
          </div>
        </div>
        <div className="icons">
          <i className="fa-solid fa-gift" style={{ fontSize: '3rem', color: '#C97874', marginRight: '2rem' }}></i>
          <div className="info">
            <h3>Bọc Sách Nghệ Thuật</h3>
            <span>Miễn phí quà tặng</span>
          </div>
        </div>
        <div className="icons">
          <i className="fa-solid fa-shield-halved" style={{ fontSize: '3rem', color: '#C97874', marginRight: '2rem' }}></i>
          <div className="info">
            <h3>Thanh toán an toàn</h3>
            <span>Bảo mật tuyệt đối</span>
          </div>
        </div>
      </section>

      {/* Service Section (Dịch vụ & Ưu đãi) */}
      <section className="service" id="service">
        <h1 className="heading"><span>Dịch Vụ</span> & Ưu Đãi</h1>
        <div className="service-container">
          
          <div className="service-box">
            <i className="fa-solid fa-tags" style={{ fontSize: '5rem', color: '#C97874', margin: '2rem 0' }}></i>
            <h3>Khuyến Mãi & Giảm Giá</h3>
            <p>Thường xuyên cập nhật mã giảm giá, voucher miễn phí vận chuyển và các đợt Flash Sale giúp bạn mua sách với mức giá tốt nhất.</p>
          </div>

          <div className="service-box">
            <i className="fa-solid fa-gift" style={{ fontSize: '5rem', color: '#C97874', margin: '2rem 0' }}></i>
            <h3>Giveaway Tặng Sách</h3>
            <p>Tham gia các sự kiện Minigame hàng tháng để có cơ hội nhận ngay những tựa sách Best-seller và quà tặng độc quyền hoàn toàn miễn phí.</p>
          </div>

          <div className="service-box">
            <i className="fa-solid fa-recycle" style={{ fontSize: '5rem', color: '#C97874', margin: '2rem 0' }}></i>
            <h3>Thu Mua & Bán Sách Cũ</h3>
            <p>Dịch vụ ký gửi, thu mua sách cũ giá cao và cung cấp các đầu sách đã qua sử dụng với độ mới trên 90%, giúp tiết kiệm chi phí và bảo vệ môi trường.</p>
          </div>

          <div className="service-box">
            <i className="fa-solid fa-shield-halved" style={{ fontSize: '5rem', color: '#C97874', margin: '2rem 0' }}></i>
            <h3>Bảo Hành 1 Đổi 1</h3>
            <p>Cam kết hỗ trợ đổi trả miễn phí trong vòng 7 ngày đối với các trường hợp sách bị lỗi in ấn, thiếu trang hoặc rách hỏng do quá trình vận chuyển.</p>
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <h1 className="heading"><span>Liên</span> Hệ</h1>
        <div className="row">
          <iframe
            title="Google Maps Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.7562854087136!2d106.34510797585094!3d10.03704257239401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a062a78129df27%3A0x6bba8476d634f19b!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBUcsOgIFZpbmg!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
            width="100%" 
            height="300" 
            style={{ border: 0, borderRadius: '8px' }} 
            allowFullScreen="" 
            loading="lazy">
          </iframe>
          <div className="contact-info">
            <div className="info-box">
              <h3>Địa Chỉ</h3>
              <p>Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh</p>
            </div>
            <div className="info-box">
              <h3>Email</h3>
              <p>contact@hieusach.com</p>
            </div>
            <div className="info-box">
              <h3>Số Điện Thoại</h3>
              <p>0123-456-789</p>
            </div>
          </div>
        </div>
      </section>
    </div>
);
}