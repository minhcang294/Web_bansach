import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Youtube, Instagram, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="kd-footer">
      
      {/* ================= CSS FOOTER ================= */}
      <style>{`
        .kd-footer { 
          background: #1a1a1a; 
          color: #bbb; 
          padding-top: 60px; 
          margin-top: 60px; 
          font-family: sans-serif; 
        }
        
        .footer-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
          gap: 40px; 
          padding-bottom: 50px; 
        }
        
        .footer-title { color: #fff; margin-bottom: 20px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
        .footer-desc { margin-bottom: 20px; line-height: 1.6; font-size: 14px; }
        
        .footer-contact { display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px; font-size: 14px; }
        .footer-contact-item { display: flex; align-items: center; gap: 10px; }
        
        /* Hiệu ứng mạng xã hội */
        .social-icons { display: flex; gap: 12px; }
        .social-btn {
          width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
          background: #333; color: #fff; border-radius: 50%; transition: all 0.3s ease; text-decoration: none;
        }
        .social-btn:hover { background: #e71a22; transform: translateY(-3px); }

        /* Hiệu ứng Hover cho Link */
        .footer-links-group { display: flex; flex-direction: column; gap: 15px; font-size: 15px; }
        .footer-link {
          color: #bbb; text-decoration: none; transition: all 0.3s ease; display: inline-block;
        }
        .footer-link:hover {
          color: #e71a22; 
          padding-left: 8px; /* Thụt đầu dòng khi hover trên máy tính */
        }

        .footer-copyright {
          border-top: 1px solid #222; text-align: center; padding: 20px 0; color: #666; font-size: 14px; background: #111;
        }

        /* ================= RESPONSIVE TABLET ================= */
        @media (max-width: 768px) {
          .kd-footer { padding-top: 40px; margin-top: 40px; }
          .footer-grid { gap: 30px; padding-bottom: 30px; }
          .footer-title { font-size: 16px; margin-bottom: 15px; }
        }

        /* ================= RESPONSIVE MOBILE ================= */
        @media (max-width: 576px) {
          .footer-grid { 
            grid-template-columns: 1fr; /* Ép về 1 cột */
            gap: 35px; 
            text-align: center; /* Căn giữa toàn bộ text */
          }
          
          /* Căn giữa các cụm icon và danh sách */
          .footer-contact { align-items: center; }
          .social-icons { justify-content: center; }
          .footer-links-group { align-items: center; }
          
          /* Đổi hiệu ứng hover trên mobile (không thụt lề nữa để tránh bị giật khung khi căn giữa) */
          .footer-link:hover {
            padding-left: 0;
            color: #e71a22;
          }
        }
      `}</style>

      <div className="container">
        
        <div className="footer-grid">
          
          {/* CỘT 1: THÔNG TIN & LIÊN HỆ */}
          <div>
            <h3 className="footer-title">
              <span style={{ color: "#fff" }}>BOOK</span>
              <span style={{ color: "#e71a22" }}>Galaxy</span>
            </h3>
            <p className="footer-desc">
              Website bán sách trực tuyến với hàng nghìn đầu sách chính hãng. Mang tri thức đến mọi nhà.
            </p>
            <div className="footer-contact">
              <span className="footer-contact-item"><MapPin size={18} color="#e71a22" /> 126 Nguyễn Thiện Thành, Trà Vinh</span>
              <span className="footer-contact-item"><Phone size={18} color="#e71a22" /> 0363 636 363</span>
              <span className="footer-contact-item"><Mail size={18} color="#e71a22" /> hotro@bookgalaxy.com</span>
            </div>
            
            {/* Mạng xã hội */}
            <div className="social-icons">
              <a href="#" className="social-btn" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" className="social-btn" aria-label="Youtube"><Youtube size={18} /></a>
              <a href="#" className="social-btn" aria-label="Instagram"><Instagram size={18} /></a>
            </div>
          </div>

          {/* CỘT 2: HỖ TRỢ */}
          <div>
            <h3 className="footer-title">Hỗ trợ</h3>
            <div className="footer-links-group">
              <Link to="#" className="footer-link">Hướng dẫn mua hàng</Link>
              <Link to="#" className="footer-link">Phương thức thanh toán</Link>
              <Link to="#" className="footer-link">Theo dõi đơn hàng</Link>
              <Link to="#" className="footer-link">Liên hệ</Link>
            </div>
          </div>

          {/* CỘT 3: DANH MỤC */}
          <div>
            <h3 className="footer-title">Danh mục</h3>
            <div className="footer-links-group">
              <Link to="/books" className="footer-link">Tất cả sách</Link>
              <Link to="/books?categoryId=van-hoc" className="footer-link">Văn học</Link>
              <Link to="/books?categoryId=thieu-nhi" className="footer-link">Thiếu nhi</Link>
              <Link to="/books?categoryId=kinh-te" className="footer-link">Kinh tế</Link>
              <Link to="/books?categoryId=ngoai-ngu" className="footer-link">Ngoại ngữ</Link>
            </div>
          </div>

          {/* CỘT 4: CHÍNH SÁCH */}
          <div>
            <h3 className="footer-title">Chính sách</h3>
            <div className="footer-links-group">
              <Link to="#" className="footer-link">Chính sách đổi trả</Link>
              <Link to="#" className="footer-link">Chính sách bảo mật</Link>
              <Link to="#" className="footer-link">Điều khoản sử dụng</Link>
              <Link to="#" className="footer-link">Vận chuyển</Link>
            </div>
          </div>

        </div>
      </div>

      {/* DÒNG BẢN QUYỀN DƯỚI CÙNG */}
      <div className="footer-copyright">
        <div className="container">
          © {new Date().getFullYear()} BookGalaxy. Tất cả các quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}