import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { SiZalo } from "react-icons/si"; 

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1a1a1a", color: "#b3b3b3", fontSize: "14px", paddingTop: "50px", borderTop: "3px solid #e71a22" }}>
      <div className="container" style={{ width: "85%", margin: "0 auto", paddingBottom: "40px" }}>
        
        {/* Lưới 4 cột */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "30px" }}>
          
          {/* CỘT 1: THÔNG TIN CÔNG TY & LIÊN HỆ */}
          <div>
            <div style={{ fontSize: "24px", fontWeight: "900", textTransform: "uppercase", marginBottom: "15px" }}>
              <span style={{ color: "#fff" }}>BOOK</span>
              <span style={{ color: "#e71a22" }}>Galaxy</span>
            </div>
            <p style={{ lineHeight: "1.6", marginBottom: "15px", fontSize: "13.5px", color: "#999" }}>
              Website bán sách trực tuyến với hàng nghìn đầu sách chính hãng. Mang tri thức đến mọi nhà.
            </p>
            
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px", color: "#ccc" }}>
              <FaMapMarkerAlt color="#e71a22" style={{ marginTop: "3px", flexShrink: 0 }} />
              <span style={{ fontSize: "13px" }}>126 Nguyễn Thiện Thành, Trà Vinh</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", color: "#ccc" }}>
              <FaPhoneAlt color="#e71a22" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "13px" }}>0363 636 363</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "#ccc" }}>
              <FaEnvelope color="#e71a22" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "13px" }}>hotro@bookgalaxy.com</span>
            </div>

            {/* NÚT ZALO LIÊN HỆ */}
            <div style={{ display: "flex", gap: "12px" }}>
              <a 
                href="https://zalo.me/0394457501" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="zalo-btn"
                title="Chat qua Zalo"
              >
                <SiZalo size={18} />
                <span>Chat Zalo</span>
              </a>
            </div>
          </div>

          {/* CỘT 2: HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", textTransform: "uppercase", marginBottom: "20px", borderBottom: "2px solid #333", paddingBottom: "8px" }}>
              Hỗ Trợ
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><Link to="#" className="footer-link">Hướng dẫn mua hàng</Link></li>
              <li><Link to="#" className="footer-link">Phương thức thanh toán</Link></li>
              <li><Link to="/orders" className="footer-link">Theo dõi đơn hàng</Link></li>
              <li><Link to="#" className="footer-link">Liên hệ với chúng tôi</Link></li>
            </ul>
          </div>

          {/* CỘT 3: DANH MỤC SÁCH */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", textTransform: "uppercase", marginBottom: "20px", borderBottom: "2px solid #333", paddingBottom: "8px" }}>
              Danh Mục
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><Link to="/books" className="footer-link">Tất cả sách</Link></li>
              <li><Link to="/books?category=van-hoc" className="footer-link">Văn học</Link></li>
              <li><Link to="/books?category=thieu-nhi" className="footer-link">Thiếu nhi</Link></li>
              <li><Link to="/books?category=kinh-te" className="footer-link">Kinh tế</Link></li>
              <li><Link to="/books?category=ngoai-ngu" className="footer-link">Ngoại ngữ</Link></li>
            </ul>
          </div>

          {/* CỘT 4: CHÍNH SÁCH */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", textTransform: "uppercase", marginBottom: "20px", borderBottom: "2px solid #333", paddingBottom: "8px" }}>
              Chính Sách
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><Link to="#" className="footer-link">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="footer-link">Chính sách bảo mật</Link></li>
              <li><Link to="#" className="footer-link">Điều khoản sử dụng</Link></li>
              <li><Link to="#" className="footer-link">Vận chuyển & Giao nhận</Link></li>
            </ul>
          </div>

        </div>

      </div>
      {/* CSS HOVER & STYLE CHO NÚT ZALO */}
      <style>{`
        .footer-link {
          color: #b3b3b3;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-block;
        }
        .footer-link:hover {
          color: #e71a22;
          transform: translateX(5px);
        }
        .zalo-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #0068ff;
          color: #fff;
          padding: 8px 16px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 600;
          font-size: 13.5px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(0, 104, 255, 0.3);
        }
        .zalo-btn:hover {
          background-color: #0052cc;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 104, 255, 0.4);
        }
      `}</style>
    </footer>
  );
}