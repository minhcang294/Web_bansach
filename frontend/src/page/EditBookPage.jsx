import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function EditBookPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy mã sách từ URL
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    bookId: id,         
    title: '',          
    author: '',         
    description: '',    
    price: '',          
    discount: '',       
    stock: '',          
    imageUrl: '',       
    category: '',       
    supplier: '',       
    translator: '',     
    publisher: '',      
    publishYear: '',    
    weight: '',         
    size: '',           
    pages: '',          
    language: 'Tiếng Việt',
    format: 'Bìa Mềm'       
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 1. TẢI DỮ LIỆU SÁCH CŨ LÊN FORM
  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/books/${id}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          const book = data.data || data; 
          
          setFormData({
            bookId: book.id || book.MASACH || book.MaSach || id,
            title: book.title || book.TENSACH || book.TenSach || '',
            author: book.author || book.TACGIA || book.TacGia || '',
            category: book.categoryId || book.THELOAI || book.TheLoai || book.category || '',
            price: book.price || book.GIABAN || book.GiaBan || 0,
            discount: book.discount || book.GIAMGIA || book.GiamGia || 0,
            stock: book.stockQuantity || book.TONKHO || book.SoLuongTon || book.soLuongTon || 0,
            description: book.description || book.MOTA || book.MoTa || '',
            imageUrl: book.imageUrl || book.ANHSACH || book.AnhSach || '',
            supplier: book.maNhaCungCap || book.MANHACUNGCAP || book.MaNhaCungCap || book.supplier || '',
            translator: book.translator || book.NGUOIDICH || book.NguoiDich || '',
            publisher: book.publisher || book.NHAXUATBAN || book.NhaXuatBan || '',
            publishYear: book.publishYear || book.NAMXUATBAN || book.NamXuatBan || '',
            weight: book.weight || book.TRONGLUONG || book.TrongLuong || '',
            size: book.dimensions || book.KICHTHUOC || book.KichThuoc || book.size || '',
            pages: book.pages || book.SOTRANG || book.SoTrang || '',
            language: book.language || book.NGONNGU || book.NgonNgu || 'Tiếng Việt',
            format: book.coverType || book.HINHTHUC || book.HinhThuc || book.format || 'Bìa Mềm'
          });
        } else {
          alert("❌ Không tìm thấy dữ liệu sách này!");
          navigate('/staff');
        }
      } catch (error) {
        alert("❌ Lỗi kết nối đến máy chủ!");
      } finally {
        setFetching(false);
      }
    };

    fetchBookDetail();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. GỬI DỮ LIỆU ĐÃ SỬA LÊN SERVER (Dùng PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🌟 ĐÃ SỬA: Chuyển sang định dạng chuẩn khớp với BookUpdateDto bên C# và chặn lỗi chuỗi rỗng của Khóa Ngoại
      const payload = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        price: Number(formData.price),
        discount: Number(formData.discount || 0),
        stockQuantity: Number(formData.stock),
        imageUrl: formData.imageUrl, 
        categoryId: formData.category, 
        
        // Tránh lỗi 500 do SQL Server từ chối chuỗi rỗng cho khóa ngoại
        maNhaCungCap: formData.supplier !== "" ? formData.supplier : null,
        supplier: formData.supplier !== "" ? formData.supplier : null,
        
        translator: formData.translator,
        publisher: formData.publisher,
        publishYear: Number(formData.publishYear || new Date().getFullYear()),
        weight: Number(formData.weight || 0),
        dimensions: formData.size,
        pages: Number(formData.pages || 0),
        language: formData.language,
        coverType: formData.format
      };

      const res = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("🎉 Cập nhật thông tin sách thành công!");
        navigate('/staff'); 
      } else {
        const errorData = await res.json();
        alert(`❌ Lỗi: ${errorData.message || errorData.title || 'Không thể cập nhật'}`);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến máy chủ!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Màn hình loading khi đang fetch dữ liệu
  if (fetching) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#6c757d', color: 'white', fontSize: '18px', gap: '15px' }}>
        <FaSpinner className="fa-spin" size={30} /> 
        Đang tải thông tin sách...
      </div>
    );
  }

  return (
    <div className="staff-edit-book-container">
      
      {/* ================= CSS CHỐNG XUNG ĐỘT (Giống 100% AddBookPage) ================= */}
      <style>{`
        .staff-edit-book-container {
          background-color: #6c757d;
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Inter', Arial, sans-serif;
        }

        .staff-edit-book-wrapper {
          width: 100%;
          max-width: 850px;
        }

        .staff-btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background-color: transparent;
          color: white;
          border: 1px solid white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          margin-bottom: 15px;
          transition: 0.2s;
        }
        .staff-btn-back:hover { background-color: rgba(255,255,255,0.1); }

        .staff-card {
          width: 100%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
        }

        .staff-card-header {
          padding: 20px 30px;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .staff-card-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 20px;
          font-weight: bold;
        }

        .staff-form {
          padding: 30px;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          display: block !important;
          text-align: left !important;
        }

        .kd-grid-2-custom { display: grid; grid-template-columns: 1fr 3fr; gap: 20px; margin-bottom: 15px; width: 100%; }
        .kd-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; width: 100%; }
        .kd-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 15px; width: 100%; }
        .kd-grid-img { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 25px; width: 100%; }

        .kd-form-group {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .kd-label {
          font-size: 14px;
          font-weight: 600;
          color: #212529;
          margin-bottom: 8px;
          white-space: nowrap; 
          display: block;
        }
        .kd-req { color: #e74c3c; margin-left: 4px; }

        .kd-input {
          width: 100% !important;
          max-width: 100% !important;
          padding: 10px 14px;
          border-radius: 4px;
          border: 1px solid #ced4da;
          font-size: 14px;
          color: #495057;
          box-sizing: border-box !important;
          background-color: #fff;
          font-family: inherit;
        }
        .kd-input:focus {
          border-color: #3498db;
          outline: none;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        /* Input bị khóa (Disabled) */
        .kd-input:disabled {
          background-color: #e9ecef;
          cursor: not-allowed;
          font-weight: bold;
          color: #6c757d;
        }

        .kd-btn-footer {
          flex: 1;
          padding: 12px;
          border-radius: 4px;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          border: none;
        }

        /* Animation cho icon Loading */
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .fa-spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="staff-edit-book-wrapper">
        <button type="button" onClick={() => navigate('/staff')} className="staff-btn-back">
          <FaArrowLeft /> Quay về Bảng điều khiển
        </button>

        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Chỉnh sửa thông tin sách</h2>
            <span style={{ fontSize: '13px', backgroundColor: '#e9ecef', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', color: '#495057' }}>
              Mã: {id}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="staff-form">
            
            {/* HÀNG 1: Mã sách & Tên sách */}
            <div className="kd-grid-2-custom">
              <div className="kd-form-group">
                <label className="kd-label">Mã sách (ID)<span className="kd-req">*</span></label>
                <input disabled type="text" name="bookId" value={formData.bookId} className="kd-input" title="Không thể thay đổi Mã sách" />
              </div>
              <div className="kd-form-group">
                <label className="kd-label">Tên sách<span className="kd-req">*</span></label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="kd-input" />
              </div>
            </div>

            {/* HÀNG 2: Tác giả */}
            <div className="kd-form-group" style={{ marginBottom: '15px' }}>
              <label className="kd-label">Tác giả</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} className="kd-input" />
            </div>

            {/* HÀNG 3: Mô tả ngắn */}
            <div className="kd-form-group" style={{ marginBottom: '15px' }}>
              <label className="kd-label">Mô tả ngắn</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="kd-input" style={{ height: '100px', resize: 'vertical' }}></textarea>
            </div>

            {/* HÀNG 4: Giá bán - Giảm giá - Số lượng tồn */}
            <div className="kd-grid-3">
              <div className="kd-form-group">
                <label className="kd-label">Giá bán (VNĐ)<span className="kd-req">*</span></label>
                <input required type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="kd-input" />
              </div>
              <div className="kd-form-group">
                <label className="kd-label">Giảm giá (%)</label>
                <input type="number" min="0" max="100" name="discount" value={formData.discount} onChange={handleChange} className="kd-input" />
              </div>
              <div className="kd-form-group">
                <label className="kd-label">Số lượng tồn<span className="kd-req">*</span></label>
                <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} className="kd-input" />
              </div>
            </div>

            {/* HÀNG 5: Ảnh bìa & Danh mục */}
            <div className="kd-grid-img">
              <div className="kd-form-group">
                <label className="kd-label">Ảnh bìa (Tải lên hoặc nhập Link)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="file" className="kd-input" style={{ flex: '1', padding: '7px' }} />
                  <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="kd-input" style={{ flex: '1' }} placeholder="Link ảnh URL dự phòng.." />
                </div>
              </div>
              <div className="kd-form-group">
                <label className="kd-label">Danh mục<span className="kd-req">*</span></label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="kd-input" placeholder="Nhập mã danh mục..." />
              </div>
            </div>

            {/* ================= KHỐI THÔNG TIN BỔ SUNG ================= */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '6px', border: '1px solid #e9ecef', marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>
                Thông tin chi tiết (Bổ sung)
              </h3>
              
              <div className="kd-grid-2">
                <div className="kd-form-group">
                  <label className="kd-label">Nhà cung cấp</label>
                  <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="kd-input" placeholder="Mã nhà cung cấp..." />
                </div>
                <div className="kd-form-group">
                  <label className="kd-label">Người dịch</label>
                  <input type="text" name="translator" value={formData.translator} onChange={handleChange} className="kd-input" />
                </div>
              </div>

              <div className="kd-grid-2">
                <div className="kd-form-group">
                  <label className="kd-label">Nhà xuất bản</label>
                  <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="kd-input" />
                </div>
                <div className="kd-form-group">
                  <label className="kd-label">Năm xuất bản</label>
                  <input type="number" min="1900" max={new Date().getFullYear()} name="publishYear" value={formData.publishYear} onChange={handleChange} className="kd-input" />
                </div>
              </div>

              <div className="kd-grid-2">
                <div className="kd-form-group">
                  <label className="kd-label">Trọng lượng (gr)</label>
                  <input type="number" min="0" name="weight" value={formData.weight} onChange={handleChange} className="kd-input" />
                </div>
                <div className="kd-form-group">
                  <label className="kd-label">Kích thước</label>
                  <input type="text" name="size" value={formData.size} onChange={handleChange} className="kd-input" />
                </div>
              </div>

              <div className="kd-grid-3">
                <div className="kd-form-group">
                  <label className="kd-label">Số trang</label>
                  <input type="number" min="0" name="pages" value={formData.pages} onChange={handleChange} className="kd-input" />
                </div>
                <div className="kd-form-group">
                  <label className="kd-label">Ngôn ngữ</label>
                  <input type="text" name="language" value={formData.language} onChange={handleChange} className="kd-input" />
                </div>
                <div className="kd-form-group">
                  <label className="kd-label">Hình thức</label>
                  <select name="format" value={formData.format} onChange={handleChange} className="kd-input">
                    <option value="Bìa Mềm">Bìa Mềm</option>
                    <option value="Bìa Cứng">Bìa Cứng</option>
                    <option value="Boxset">Boxset</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ================= NÚT FOOTER ================= */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                type="button" 
                onClick={() => navigate('/staff')}
                className="kd-btn-footer"
                style={{ backgroundColor: '#f8f9fa', color: '#212529', border: '1px solid #ced4da' }}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="kd-btn-footer"
                style={{ backgroundColor: '#f39c12', color: 'white', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}