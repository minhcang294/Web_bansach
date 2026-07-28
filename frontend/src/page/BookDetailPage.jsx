import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { bookApi } from "../api/bookApi.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    bookApi.getById(id)
      .then((res) => { 
        setBook(res.data); 
        setQty(1); 
      })
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) { 
      navigate("/login"); 
      return; 
    }
    const res = await addToCart(book.id || book.maSach, qty);
    setMsg(res.success 
      ? { type: "success", text: "Đã thêm vào giỏ hàng thành công!" } 
      : { type: "error", text: res.message }
    );
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { 
      navigate("/login"); 
      return; 
    }
    const res = await addToCart(book.id || book.maSach, qty);
    if (res.success) {
      navigate("/cart"); 
    } else {
      setMsg({ type: "error", text: res.message });
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', fontSize: '18px', color: '#666' }}>Đang tải thông tin sách...</div>;
  }

  if (!book) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#e74c3c', fontSize: '18px' }}>Không tìm thấy cuốn sách này.</div>;
  }

  return (
    <div style={{ backgroundColor: '#f5f5fa', padding: '30px 0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
        
        {/* Nút quay lại danh sách */}
        <Link to="/books" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#666", marginBottom: 20, textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Quay lại danh sách sách
        </Link>

        {/* BỐ CỤC 2 CỘT CHUYÊN NGHIỆP */}
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* ================= CỘT TRÁI ================= */}
          <div style={{ flex: '1 1 350px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Khối Ảnh bìa */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <img 
                src={book.imageUrl || book.anhSach || 'https://via.placeholder.com/300x420?text=No+Image'} 
                alt={book.title || book.tenSach} 
                style={{ width: "100%", maxHeight: "420px", borderRadius: 8, objectFit: "contain" }} 
              />
            </div>

            {/* Khối Số lượng & Nút bấm */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              
              {/* PHẦN SỐ LƯỢNG: Đã tinh chỉnh lại giống hệt mẫu ảnh */}
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                <span style={{ fontWeight: '600', color: '#333', fontSize: '15px' }}>Số lượng:</span>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  backgroundColor: '#fff',
                  width: 'fit-content'
                }}>
                  <button 
                    onClick={() => setQty(q => Math.max(1, q - 1))} 
                    type="button" 
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      backgroundColor: 'transparent', 
                      border: 'none', 
                      borderRight: '1px solid #d1d5db', 
                      cursor: 'pointer', 
                      color: '#374151', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Minus size={16} />
                  </button>

                  <span style={{ 
                    width: '45px', 
                    textAlign: 'center', 
                    fontWeight: 'bold', 
                    fontSize: '16px', 
                    color: '#1f2937' 
                  }}>
                    {qty}
                  </span>

                  <button 
                    onClick={() => setQty(q => Math.min(book.stockQuantity || book.soLuongTon || 100, q + 1))} 
                    type="button" 
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      backgroundColor: 'transparent', 
                      border: 'none', 
                      borderLeft: '1px solid #d1d5db', 
                      cursor: 'pointer', 
                      color: '#374151', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* HAI NÚT BẰNG NHAU */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleAdd} 
                  disabled={cartLoading}
                  style={{ flex: 1, padding: '12px 10px', backgroundColor: '#fff', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <ShoppingCart size={17} /> Thêm vào giỏ
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                  style={{ flex: 1, padding: '12px 10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap' }}
                >
                  Mua ngay
                </button>
              </div>

              {/* Thông báo trạng thái */}
              {msg.text && (
                <div style={{ 
                  marginTop: 15, 
                  padding: "10px 12px", 
                  borderRadius: "6px", 
                  fontWeight: "600",
                  fontSize: '13px',
                  backgroundColor: msg.type === 'success' ? '#e8f5e9' : '#ffebee',
                  color: msg.type === 'success' ? '#2e7d32' : '#c62828'
                }}>
                  {msg.text}
                </div>
              )}
            </div>

            {/* Khối Chính sách ưu đãi */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>Chính sách ưu đãi của BookGalaxy</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#555', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🚚 Thời gian giao hàng: Giao nhanh và uy tín</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🔄 Chính sách đổi trả: Đổi trả miễn phí toàn quốc</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📦 Chính sách khách sỉ: Ưu đãi khi mua số lượng lớn</li>
              </ul>
            </div>

          </div>

          {/* ================= CỘT PHẢI ================= */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header: Tên, Tác giả, Giá */}
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h1 style={{ fontSize: 26, marginBottom: 10, color: "#222", lineHeight: 1.3 }}>
                {book.title || book.tenSach}
              </h1>
              
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', marginBottom: '15px', color: '#555' }}>
                <span>Tác giả: <strong style={{ color: "#333" }}>{book.author || book.tacGia || 'Đang cập nhật'}</strong></span>
                <span>Hình thức: <strong>{book.coverType || book.hinhThuc || 'Bìa Mềm'}</strong></span>
              </div>

              <div style={{ fontSize: 32, fontWeight: 700, color: "#d91c24", marginBottom: 10 }}>
                {formatCurrency(book.price || book.giaBan)}
              </div>
            </div>

            {/* Bảng Thông tin chi tiết */}
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333', borderBottom: '2px solid #f4f6f8', paddingBottom: '8px' }}>
                Thông tin chi tiết
              </h3>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', width: '35%', backgroundColor: '#fafafa' }}>Mã hàng</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.id || book.maSach || 'Đang cập nhật'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>Tên Nhà Cung Cấp</td>
                    <td style={{ padding: '10px', color: '#3498db', fontWeight: '500' }}>{book.supplier || book.nhaCungCap || 'Đang cập nhật'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>Tác giả</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.author || book.tacGia || 'Đang cập nhật'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>Người Dịch</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.translator || book.nguoiDich || 'Đang cập nhật'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>NXB</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.publisher || book.nhaXuatBan || 'Đang cập nhật'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>Năm XB</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.publishYear || book.namXuatBan || 'Đang cập nhật'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>Ngôn Ngữ</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.language || book.ngonNgu || 'Tiếng Việt'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>Trọng lượng (gr)</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.weight || book.trongLuong || 'Đang cập nhật'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>Kích Thước Bao Bì</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.dimensions || book.kichThuoc || 'Đang cập nhật'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>Số trang</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.pages || book.soTrang || 'Đang cập nhật'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', color: '#777', backgroundColor: '#fafafa' }}>Hình thức</td>
                    <td style={{ padding: '10px', color: '#333' }}>{book.coverType || book.hinhThuc || 'Đang cập nhật'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mô tả sản phẩm */}
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333', borderBottom: '2px solid #f4f6f8', paddingBottom: '8px' }}>
                Mô tả sản phẩm
              </h3>
              <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#555', whiteSpace: 'pre-line' }}>
                {book.description || book.noiDungDemo || 'Chưa có mô tả cho sản phẩm này.'}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}