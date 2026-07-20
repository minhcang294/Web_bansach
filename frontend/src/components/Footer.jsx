import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Youtube, Instagram, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "#1a1a1a", color: "#bbb", paddingTop: "60px", marginTop: "60px" }}>
      <div className="container">
        
        {/* ĐÃ XÓA HOÀN TOÀN THANH MÀU ĐỎ ĐĂNG KÝ NHẬN TIN */}

        {/* LƯỚI 4 CỘT FOOTER ĐƯỢC BỐ TRÍ LẠI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "40px", paddingBottom: "50px" }}>
          
          {/* CỘT 1: THÔNG TIN & LIÊN HỆ (Đã gom chung cho gọn) */}
          <div>
            <h3 style={{ color: "#fff", marginBottom: "20px", fontSize: "18px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Hiệu Sách
            </h3>
            <p style={{ marginBottom: "20px", lineHeight: "1.6", fontSize: "14px" }}>
              Website bán sách trực tuyến với hàng nghìn đầu sách chính hãng. Mang tri thức đến mọi nhà.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "25px", fontSize: "14px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={18} color="#e60023" /> 97 Lê Thanh Nghị, Hà Nội
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={18} color="#e60023" /> 1900 571595
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={18} color="#e60023" /> hotro@hieusach.com
              </span>
            </div>
            
            {/* Mạng xã hội */}
            <div style={{ display: "flex", gap: "12px" }}>
              <a href="#" style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", background: "#333", color: "#fff", borderRadius: "50%", transition: "0.3s" }} onMouseOver={(e) => e.currentTarget.style.background = "#e60023"} onMouseOut={(e) => e.currentTarget.style.background = "#333"}><Facebook size={18} /></a>
              <a href="#" style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", background: "#333", color: "#fff", borderRadius: "50%", transition: "0.3s" }} onMouseOver={(e) => e.currentTarget.style.background = "#e60023"} onMouseOut={(e) => e.currentTarget.style.background = "#333"}><Youtube size={18} /></a>
              <a href="#" style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", background: "#333", color: "#fff", borderRadius: "50%", transition: "0.3s" }} onMouseOver={(e) => e.currentTarget.style.background = "#e60023"} onMouseOut={(e) => e.currentTarget.style.background = "#333"}><Instagram size={18} /></a>
            </div>
          </div>

          {/* CỘT 2: HỖ TRỢ */}
          <div>
            <h3 style={{ color: "#fff", marginBottom: "20px", fontSize: "18px", textTransform: "uppercase", letterSpacing: "1px" }}>Hỗ trợ</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", fontSize: "15px" }}>
              <Link to="#" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Hướng dẫn mua hàng</Link>
              <Link to="#" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Phương thức thanh toán</Link>
              <Link to="#" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Theo dõi đơn hàng</Link>
              <Link to="#" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Liên hệ</Link>
            </div>
          </div>

          {/* CỘT 3: DANH MỤC */}
          <div>
            <h3 style={{ color: "#fff", marginBottom: "20px", fontSize: "18px", textTransform: "uppercase", letterSpacing: "1px" }}>Danh mục</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", fontSize: "15px" }}>
              <Link to="/books" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Tất cả sách</Link>
              <Link to="/books?categoryId=van-hoc" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Văn học</Link>
              <Link to="/books?categoryId=thieu-nhi" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Thiếu nhi</Link>
              <Link to="/books?categoryId=kinh-te" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Kinh tế</Link>
              <Link to="/books?categoryId=ngoai-ngu" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Ngoại ngữ</Link>
            </div>
          </div>

          {/* CỘT 4: CHÍNH SÁCH */}
          <div>
            <h3 style={{ color: "#fff", marginBottom: "20px", fontSize: "18px", textTransform: "uppercase", letterSpacing: "1px" }}>Chính sách</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", fontSize: "15px" }}>
              <Link to="#" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Chính sách đổi trả</Link>
              <Link to="#" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Chính sách bảo mật</Link>
              <Link to="#" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Điều khoản sử dụng</Link>
              <Link to="#" style={{ transition: "0.2s" }} onMouseOver={(e) => { e.currentTarget.style.color = "#e60023"; e.currentTarget.style.paddingLeft = "5px"; }} onMouseOut={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.paddingLeft = "0"; }}>Vận chuyển</Link>
            </div>
          </div>

        </div>
      </div>

      {/* DÒNG BẢN QUYỀN DƯỚI CÙNG */}
      <div style={{ borderTop: "1px solid #222", textAlign: "center", padding: "20px 0", color: "#666", fontSize: "14px", background: "#111" }}>
        <div className="container">
          © {new Date().getFullYear()} Hiệu Sách. Tất cả các quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}