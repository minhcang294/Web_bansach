import React, { useState, useEffect } from 'react';
import { FaWarehouse, FaPlus, FaTimes, FaFileInvoiceDollar, FaEye, FaEdit, FaTrash } from "react-icons/fa";

const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#34495e' };

export default function ImportManagement() {
  const [imports, setImports] = useState([]);
  const [books, setBooks] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // 🌟 ĐÃ THÊM: State lưu danh sách nhà cung cấp
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    maPhieuNhap: '',
    maNhaCungCap: '',
    maNhanVien: 'NV001',
    chiTietPhieuNhaps: [{ maSach: '', soLuongNhap: 1, giaNhap: 0 }]
  });

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchImports(),
        fetchBooks(),
        fetchSuppliers() // 🌟 ĐÃ THÊM: Gọi API lấy nhà cung cấp cùng lúc
      ]);
    } catch (error) {
      console.error("Lỗi tải dữ liệu kho:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImports = async () => {
    try {
      const res = await fetch('http://18.232.139.209:5000/api/imports');
      if (res.ok) {
        const data = await res.json();
        setImports(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Lỗi gọi API imports:", e);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch('http://18.232.139.209:5000/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data.items || data || []);
      }
    } catch (e) {
      console.error("Lỗi gọi API books:", e);
    }
  };

  // 🌟 ĐÃ THÊM: Hàm gọi API lấy danh sách nhà cung cấp
  const fetchSuppliers = async () => {
    try {
      const res = await fetch('http://18.232.139.209:5000/api/NhaCungCap', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSuppliers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Lỗi gọi API nhà cung cấp:", e);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      maPhieuNhap: `PN00${imports.length + 1}`,
      maNhaCungCap: '',
      maNhanVien: 'NV001',
      chiTietPhieuNhaps: [{ maSach: '', soLuongNhap: 10, giaNhap: 20000 }]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({
      maPhieuNhap: item.maPhieuNhap,
      maNhaCungCap: item.maNhaCungCap, // Đã sửa để map chuẩn mã NCC vào Dropdown
      maNhanVien: item.maNhanVien || 'NV001',
      chiTietPhieuNhaps: item.chiTietPhieuNhaps.map(ct => ({
        maSach: ct.tenSach || ct.maSach,
        soLuongNhap: ct.soLuongNhap,
        giaNhap: ct.giaNhap
      }))
    });
    setShowModal(true);
  };

  const handleAddDetailRow = () => {
    setFormData({
      ...formData,
      chiTietPhieuNhaps: [...formData.chiTietPhieuNhaps, { maSach: '', soLuongNhap: 10, giaNhap: 20000 }]
    });
  };

  const handleRemoveDetailRow = (index) => {
    const list = [...formData.chiTietPhieuNhaps];
    list.splice(index, 1);
    setFormData({ ...formData, chiTietPhieuNhaps: list });
  };

  const handleDetailChange = (index, field, value) => {
    const list = [...formData.chiTietPhieuNhaps];
    list[index][field] = value;
    setFormData({ ...formData, chiTietPhieuNhaps: list });
  };

  const handleSaveImport = async () => {
    if (!formData.maPhieuNhap || !formData.maNhaCungCap) {
      alert("Vui lòng điền mã phiếu nhập và chọn nhà cung cấp!");
      return;
    }

    const url = isEditing 
      ? `http://18.232.139.209:5000/api/imports/${formData.maPhieuNhap}` 
      : 'http://18.232.139.209:5000/api/imports';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(isEditing ? "Cập nhật phiếu nhập thành công!" : "Tạo phiếu nhập thành công và đã tự động cập nhật kho/sách mới!");
        setShowModal(false);
        fetchData(); 
      } else {
        const err = await res.json();
        alert("Lỗi: " + (err.message || "Không thể lưu phiếu nhập"));
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleDelete = async (maPhieuNhap) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phiếu nhập ${maPhieuNhap}? (Tồn kho sách sẽ được trừ lại tương ứng)`)) return;

    try {
      const res = await fetch(`http://18.232.139.209:5000/api/imports/${maPhieuNhap}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (res.ok) {
        alert("Đã xóa phiếu nhập thành công!");
        fetchData();
      } else {
        const err = await res.json();
        alert("Lỗi: " + (err.message || "Không thể xóa"));
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleViewDetail = (item) => {
    setSelectedImport(item);
    setShowDetailModal(true);
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu kho...</div>;

  return (
    <div style={{ padding: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaWarehouse color="#1abc9c" /> Quản lý Nhập Kho Sách
        </h2>
        <button 
          onClick={handleOpenAdd} 
          style={{ 
            padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', 
            borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
            width: 'fit-content', whiteSpace: 'nowrap'
          }}
        >
          <FaPlus /> Tạo phiếu nhập mới
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f8', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '15px' }}>Mã PN</th>
              <th style={{ padding: '15px' }}>Ngày Nhập</th>
              <th style={{ padding: '15px' }}>Nhà Cung Cấp</th>
              <th style={{ padding: '15px' }}>Người Phụ Trách</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Tổng Tiền</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {imports.length > 0 ? (
              imports.map((item, idx) => (
                <tr key={item.maPhieuNhap || idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#2980b9' }}>{item.maPhieuNhap}</td>
                  <td style={{ padding: '15px' }}>{new Date(item.ngayNhap).toLocaleString('vi-VN')}</td>
                  <td style={{ padding: '15px' }}>{item.tenNhaCungCap || item.maNhaCungCap}</td>
                  <td style={{ padding: '15px' }}>{item.tenNhanVien || item.maNhanVien}</td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#c0392b', fontWeight: 'bold' }}>
                    {Number(item.tongTien).toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleViewDetail(item)} title="Xem chi tiết" style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}><FaEye /></button>
                      <button onClick={() => handleOpenEdit(item)} title="Sửa" style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}><FaEdit /></button>
                      <button onClick={() => handleDelete(item.maPhieuNhap)} title="Xóa" style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>Chưa có phiếu nhập kho nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL XEM CHI TIẾT */}
      {showDetailModal && selectedImport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '650px', maxWidth: '90%', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #f4f6f8', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Chi tiết Phiếu Nhập: {selectedImport.maPhieuNhap}</h3>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#95a5a6', padding: 0, width: 'fit-content' }}>
                <FaTimes />
              </button>
            </div>
            
            <p style={{ margin: '5px 0' }}><b>Ngày nhập:</b> {new Date(selectedImport.ngayNhap).toLocaleString('vi-VN')}</p>
            <p style={{ margin: '5px 0' }}><b>Nhà cung cấp:</b> {selectedImport.tenNhaCungCap}</p>
            <p style={{ margin: '5px 0 15px 0' }}><b>Người phụ trách:</b> {selectedImport.tenNhanVien}</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f4f6f8', borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>Tên Sách</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Số lượng</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Giá Nhập</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedImport.chiTietPhieuNhaps?.map((ct, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{ct.tenSach}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{ct.soLuongNhap}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{Number(ct.giaNhap).toLocaleString('vi-VN')} đ</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{Number(ct.thanhTien).toLocaleString('vi-VN')} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowDetailModal(false)} style={{ padding: '10px 25px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: 'fit-content' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO / SỬA PHIẾU NHẬP */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '750px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f4f6f8', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaFileInvoiceDollar /> {isEditing ? `Cập nhật Phiếu Nhập: ${formData.maPhieuNhap}` : 'Lập Phiếu Nhập Kho Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#95a5a6', padding: 0, width: 'fit-content' }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Mã Phiếu Nhập*</label>
                <input style={{ ...inputStyle, backgroundColor: isEditing ? '#f1f2f6' : 'white' }} disabled={isEditing} value={formData.maPhieuNhap} onChange={e => setFormData({...formData, maPhieuNhap: e.target.value})} placeholder="VD: PN002" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Nhà Cung Cấp*</label>
                {/* 🌟 ĐÃ THAY ĐỔI: Chuyển input thành select dropdown */}
                <select 
                  style={inputStyle} 
                  value={formData.maNhaCungCap} 
                  onChange={e => setFormData({...formData, maNhaCungCap: e.target.value})}
                  required
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map(ncc => (
                    <option key={ncc.maNhaCungCap} value={ncc.maNhaCungCap}>
                      {ncc.tenNhaCungCap} - {ncc.maNhaCungCap}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h4 style={{ marginBottom: '10px', color: '#34495e', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Chi tiết sách nhập</h4>
            
            {formData.chiTietPhieuNhaps.map((detail, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '11px', color: '#666' }}>Tên hoặc Mã Sách</label>
                  <input 
                    type="text" 
                    list="book-suggestions"
                    style={inputStyle} 
                    value={detail.maSach} 
                    onChange={e => handleDetailChange(index, 'maSach', e.target.value)} 
                    placeholder="Chọn hoặc gõ tên sách mới..." 
                  />
                  <datalist id="book-suggestions">
                    {books.map(b => {
                      const bId = b.id || b.maSach || b.MASACH;
                      const bTitle = b.title || b.tenSach || b.TENSACH;
                      return <option key={bId} value={bTitle}>{bId}</option>;
                    })}
                  </datalist>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: '#666' }}>Số lượng</label>
                  <input type="number" style={inputStyle} value={detail.soLuongNhap} onChange={e => handleDetailChange(index, 'soLuongNhap', Number(e.target.value))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: '#666' }}>Giá nhập (VNĐ)</label>
                  <input type="number" style={inputStyle} value={detail.giaNhap} onChange={e => handleDetailChange(index, 'giaNhap', Number(e.target.value))} />
                </div>
                <div style={{ marginTop: '18px' }}>
                  {formData.chiTietPhieuNhaps.length > 1 && (
                    <button onClick={() => handleRemoveDetailRow(index)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 12px', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}>X</button>
                  )}
                </div>
              </div>
            ))}

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button onClick={handleAddDetailRow} style={{ padding: '8px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', width: 'fit-content', display: 'inline-block' }}>
                + Thêm dòng sách khác
              </button>
            </div>

            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 25px', backgroundColor: '#ecf0f1', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: 'fit-content' }}>Hủy</button>
              <button onClick={handleSaveImport} style={{ padding: '10px 25px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: 'fit-content' }}>{isEditing ? 'Lưu thay đổi' : 'Hoàn tất Nhập Kho'}</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}