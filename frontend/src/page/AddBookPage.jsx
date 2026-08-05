import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AddBookPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [categoryList, setCategoryList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const [formData, setFormData] = useState({
    bookId: '',         
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

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        let resCat = await fetch(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() });
        if (!resCat.ok && resCat.status === 404) resCat = await fetch(`${API_BASE_URL}/danhmuc`, { headers: getAuthHeaders() });
        if (resCat.ok) {
          const data = await resCat.json();
          setCategoryList(Array.isArray(data) ? data : (data.data || data.items || []));
        }

        let resSup = await fetch(`${API_BASE_URL}/suppliers`, { headers: getAuthHeaders() });
        if (!resSup.ok && resSup.status === 404) resSup = await fetch(`${API_BASE_URL}/nhacungcap`, { headers: getAuthHeaders() });
        if (resSup.ok) {
          const data = await resSup.json();
          setSupplierList(Array.isArray(data) ? data : (data.data || data.items || []));
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu dropdown:", error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        bookId: formData.bookId, // Giữ nguyên mã người dùng gõ (ví dụ: S12)
        title: formData.title,
        author: formData.author,
        description: formData.description,
        price: Number(formData.price),
        discount: Number(formData.discount || 0),
        stockQuantity: Number(formData.stock),
        imageUrl: formData.imageUrl, 
        categoryId: formData.category, 
        maNhaCungCap: formData.supplier !== "" ? formData.supplier : null,
        translator: formData.translator,
        publisher: formData.publisher,
        publishYear: Number(formData.publishYear || new Date().getFullYear()),
        weight: Number(formData.weight || 0),
        dimensions: formData.size,
        pages: Number(formData.pages || 0),
        language: formData.language,
        coverType: formData.format
      };

      const res = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("🎉 Thêm sách mới thành công!");
        navigate('/staff'); 
      } else {
        if (res.status === 403) {
          alert("❌ Lỗi 403 (Forbidden): Tài khoản Nhân viên chưa được cấp quyền Thêm sách.");
        } else {
          try {
            const errorText = await res.text();
            let errorMsg = errorText;
            try {
              const errorJson = JSON.parse(errorText);
              errorMsg = errorJson.message || errorJson.title || errorText;
            } catch (e) { /* Ignore json parse error */ }
            alert(`❌ Lỗi: ${errorMsg || 'Không thể thêm sách'}`);
          } catch (err) {
            alert("❌ Lỗi: Không thể thêm sách và không đọc được lỗi từ máy chủ.");
          }
        }
      }
    } catch (error) {
      alert("❌ Lỗi kết nối đến máy chủ!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-add-book-container">
      <style>{`
        .staff-add-book-container { background-color: #6c757d; min-height: 100vh; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; font-family: 'Inter', Arial, sans-serif; }
        .staff-add-book-wrapper { width: 100%; max-width: 850px; }
        .staff-btn-back { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background-color: transparent; color: white; border: 1px solid white; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 15px; transition: 0.2s; }
        .staff-btn-back:hover { background-color: rgba(255,255,255,0.1); }
        .staff-card { width: 100%; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); overflow: hidden; }
        .staff-card-header { padding: 20px 30px; border-bottom: 1px solid #e9ecef; }
        .staff-card-header h2 { margin: 0; color: #2c3e50; font-size: 20px; font-weight: bold; }
        .staff-form { padding: 30px; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; display: block !important; text-align: left !important; }
        .kd-grid-2-custom { display: grid; grid-template-columns: 1fr 3fr; gap: 20px; margin-bottom: 15px; width: 100%; }
        .kd-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; width: 100%; }
        .kd-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 15px; width: 100%; }
        .kd-grid-img { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 25px; width: 100%; }
        .kd-form-group { display: flex; flex-direction: column; width: 100%; }
        .kd-label { font-size: 14px; font-weight: 600; color: #212529; margin-bottom: 8px; white-space: nowrap; display: block; }
        .kd-req { color: #e74c3c; margin-left: 4px; }
        .kd-input { width: 100% !important; max-width: 100% !important; padding: 10px 14px; border-radius: 4px; border: 1px solid #ced4da; font-size: 14px; color: #495057; box-sizing: border-box !important; background-color: #fff; font-family: inherit; }
        .kd-input:focus { border-color: #3498db; outline: none; box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2); }
        .kd-btn-footer { flex: 1; padding: 12px; border-radius: 4px; font-size: 15px; font-weight: bold; cursor: pointer; border: none; }
      `}</style>

      <div className="staff-add-book-wrapper">
        <button type="button" onClick={() => navigate('/staff')} className="staff-btn-back">
          <FaArrowLeft /> Quay về Bảng điều khiển
        </button>

        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Thêm sách mới</h2>
          </div>

          <form onSubmit={handleSubmit} className="staff-form">
            
            <div className="kd-grid-2-custom">
              <div className="kd-form-group">
                <label className="kd-label">Mã sách (ID)<span className="kd-req">*</span></label>
                <input required type="text" name="bookId" value={formData.bookId} onChange={handleChange} className="kd-input" />
              </div>
              <div className="kd-form-group">
                <label className="kd-label">Tên sách<span className="kd-req">*</span></label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="kd-input" />
              </div>
            </div>

            <div className="kd-form-group" style={{ marginBottom: '15px' }}>
              <label className="kd-label">Tác giả</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} className="kd-input" />
            </div>

            <div className="kd-form-group" style={{ marginBottom: '15px' }}>
              <label className="kd-label">Mô tả ngắn</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="kd-input" style={{ height: '100px', resize: 'vertical' }}></textarea>
            </div>

            <div className="kd-grid-3">
              <div className="kd-form-group">
                <label className="kd-label">Giá bán (VNĐ)<span className="kd-req">*</span></label>
                <input required type="number" min="0" name="price" value={formData.price} onChange={handleChange} className="kd-input" />
              </div>
              <div className="kd-form-group">
                <label className="kd-label">Giảm giá (%)</label>
                <input type="number" min="0" max="100" name="discount" value={formData.discount} onChange={handleChange} className="kd-input" placeholder="VD: 10" />
              </div>
              <div className="kd-form-group">
                <label className="kd-label">Số lượng tồn<span className="kd-req">*</span></label>
                <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} className="kd-input" />
              </div>
            </div>

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
                <select required name="category" value={formData.category} onChange={handleChange} className="kd-input">
                  <option value="" style={{ color: '#64748b' }}>-- Chọn danh mục --</option>
                  {categoryList.map((cat, idx) => {
                    const parent = cat.thuocNhom ?? cat.ThuocNhom ?? cat.maDanhMucCha ?? cat.MaDanhMucCha ?? cat.parentId ?? cat.ParentId ?? cat.parentGroup;
                    const isRoot = parent === undefined || parent === null || parent === '--- (Gốc) ---' || parent === 0 || parent === '0' || String(parent).trim() === '';
                    
                    const name = cat.tenDanhMuc || cat.TenDanhMuc || cat.categoryName || cat.name || '';
                    const value = cat.maDanhMuc || cat.MaDanhMuc || cat.id || cat.categoryName;

                    return (
                      <option 
                        key={idx} 
                        value={value}
                        style={isRoot ? { fontWeight: 'bold', color: '#0284c7' } : { fontWeight: 'normal', color: '#475569' }}
                      >
                        {isRoot ? name : `\u00A0\u00A0\u00A0- ${name}`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* ================= KHỐI THÔNG TIN BỔ SUNG ================= */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '6px', border: '1px solid #e9ecef', marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>
                Thông chi tiết (Bổ sung)
              </h3>
              
              <div className="kd-grid-2">
                <div className="kd-form-group">
                  <label className="kd-label">Nhà cung cấp</label>
                  <select name="supplier" value={formData.supplier} onChange={handleChange} className="kd-input">
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {supplierList.map((sup, idx) => {
                      const name = sup.tenNhaCungCap || sup.supplierName || sup.name || '';
                      const value = sup.maNhaCungCap || sup.id || sup.supplierName;
                      return (
                        <option key={idx} value={value} style={{ fontWeight: '600', color: '#1e293b' }}>{name}</option>
                      );
                    })}
                  </select>
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
                style={{ backgroundColor: '#3498db', color: 'white', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Đang xử lý...' : 'Lưu Sách'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}