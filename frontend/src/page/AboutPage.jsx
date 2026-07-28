import React from 'react';
import { BookOpen, Target, Award, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* Banner Khởi đầu */}
      <div style={{ backgroundColor: '#e74c3c', color: 'white', padding: '60px 20px', textAlign: 'center', backgroundImage: 'linear-gradient(to right, #e74c3c, #c0392b)' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '15px' }}>Về BookGalaxy</h1>
        <p style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6', opacity: 0.9 }}>
          Hành trình mang tri thức nhân loại đến gần hơn với mọi gia đình Việt. Chúng tôi không chỉ bán sách, chúng tôi trao gửi những giá trị tinh thần vô giá.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', transform: 'translateY(-30px)' }}>
        
        {/* Khối Sứ mệnh & Tầm nhìn */}
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 400px', backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', color: '#2980b9' }}>
              <Target size={32} />
              <h2 style={{ fontSize: '24px', margin: 0, color: '#333' }}>Tầm Nhìn</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.7' }}>
              Trở thành nền tảng phân phối sách trực tuyến hàng đầu Việt Nam. Nơi hội tụ của những tâm hồn yêu sách, kết nối độc giả với những tác phẩm kinh điển và hiện đại một cách nhanh chóng, tiện lợi nhất.
            </p>
          </div>

          <div style={{ flex: '1 1 400px', backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', color: '#27ae60' }}>
              <BookOpen size={32} />
              <h2 style={{ fontSize: '24px', margin: 0, color: '#333' }}>Sứ Mệnh</h2>
            </div>
            <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.7' }}>
              Khơi dậy văn hóa đọc trong cộng đồng. BookGalaxy cam kết cung cấp 100% sách bản quyền, chất lượng cao với mức giá hợp lý, đồng hành cùng thế hệ trẻ Việt Nam trên con đường chinh phục tri thức.
            </p>
          </div>

        </div>

        {/* Khối Giá trị cốt lõi */}
        <div style={{ marginTop: '50px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '28px', color: '#2c3e50', marginBottom: '40px' }}>Giá Trị Lõi Từ BookGalaxy</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            {/* Item 1 */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f2f6' }}>
              <div style={{ backgroundColor: '#fdf2f2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#e74c3c' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>100% Sách Chính Hãng</h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>Nói không với sách lậu, sách giả. Cam kết bảo vệ quyền lợi tác giả và nhà xuất bản.</p>
            </div>

            {/* Item 2 */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f2f6' }}>
              <div style={{ backgroundColor: '#f0f8ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#3498db' }}>
                <Truck size={28} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>Giao Hàng Siêu Tốc</h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>Đóng gói cẩn thận, vận chuyển nhanh chóng đến mọi miền tổ quốc.</p>
            </div>

            {/* Item 3 */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f2f6' }}>
              <div style={{ backgroundColor: '#fff8e1', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#f39c12' }}>
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>Chất Lượng Dịch Vụ</h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>Hỗ trợ tận tình, đổi trả dễ dàng nếu có bất kỳ lỗi nào từ nhà sản xuất.</p>
            </div>

            {/* Item 4 */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f2f6' }}>
              <div style={{ backgroundColor: '#e8f8f5', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#1abc9c' }}>
                <HeartHandshake size={28} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>Giá Cả Cạnh Tranh</h3>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>Thường xuyên có các chương trình khuyến mãi, ưu đãi hấp dẫn tri ân khách hàng.</p>
            </div>

          </div>
        </div>

        {/* Nút kêu gọi hành động */}
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Bạn đã sẵn sàng khám phá kho tàng tri thức?</h2>
          <Link to="/" style={{ display: 'inline-block', backgroundColor: '#e74c3c', color: '#fff', padding: '15px 40px', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)' }}>
            Mua Sách Ngay
          </Link>
        </div>

      </div>
    </div>
  );
}