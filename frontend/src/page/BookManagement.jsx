import React, { useState, useEffect } from 'react';

const initialBookState = {
  id: '',
  title: '',
  author: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  imageUrl: '',
  categoryId: '',
  supplier: '',
  translator: '',
  publisher: '',
  publishYear: '',
  language: 'Tiếng Việt',
  weight: '',
  dimensions: '',
  pages: '',
  coverType: 'Bìa Mềm',
  discount: 0
};

const inputStyle = { width: '100%', marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '14px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#34495e' };

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [danhMucs, setDanhMucs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newBook, setNewBook] = useState(initialBookState);
  const [searchTerm, setSearchTerm] = useState('');

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchBooks(), fetchDanhMucs(), fetchSuppliers()]);
    setLoading(false);
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data.items || data || []);
      }
    } catch (error) { console.error("Lỗi khi tải sách:", error); }
  };

  const fetchDanhMucs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories'); 
      if (response.ok) {
        const data = await response.json();
        setDanhMucs(data || []);
      }
    } catch (error) { console.error("Lỗi tải danh mục:", error); }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/NhaCungCap', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(Array.isArray(data) ? data : []);
      }
    } catch (error) { console.error("Lỗi tải nhà cung cấp:", error); }
  };

  const handleOpenAdd = () => {
    setNewBook({ ...initialBookState, categoryId: '', supplier: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (book) => {
    setNewBook({
      id: book.id || book.maSach || book.MASACH || '',
      title: book.title || book.tenSach || book.TENSACH || '',
      author: book.author || book.tacGia || book.TACGIA || '',
      description: book.description || book.noiDungDemo || book.NOIDUNGDEMO || '',
      price: book.price || book.giaBan || book.GIABAN || 0,
      stockQuantity: book.stockQuantity ?? book.soLuongTon ?? book.SOLUONGTON ?? 0,
      imageUrl: book.imageUrl || book.anhSach || book.ANHSACH || '',
      categoryId: book.categoryId || book.maDanhMuc || book.MADANHMUC || '',
      supplier: book.supplier || book.maNhaCungCap || book.nhaCungCap || book.NHACUNGCAP || '',
      translator: book.translator || book.nguoiDich || book.NGUOIDICH || '',
      publisher: book.publisher || book.nhaXuatBan || book.NHAXUATBAN || '',
      publishYear: book.publishYear || book.namXuatBan || book.NAMXUATBAN || 0,
      language: book.language || book.ngonNgu || book.NGONNGU || 'Tiếng Việt',
      weight: book.weight || book.trongLuong || book.TRONGLUONG || 0,
      dimensions: book.dimensions || book.kichThuoc || book.KICHTHUOC || '',
      pages: book.pages || book.soTrang || book.SOTRANG || 0,
      coverType: book.coverType || book.hinhThuc || book.HINHTHUC || 'Bìa Mềm',
      discount: book.discount || book.giamGia || book.GIAMGIA || 0
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); 

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData 
      });

      if (response.ok) {
        const data = await response.json();
        const fullImageUrl = `http://localhost:5000${data.imageUrl}`;
        
        setNewBook({ ...newBook, imageUrl: fullImageUrl });
        alert("Đã tải ảnh lên thành công!");
      } else {
        alert("Lỗi Upload: API tải ảnh thất bại. Kiểm tra lại server Backend!");
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      alert("Lỗi kết nối! Bạn hãy dùng chức năng nhập Link URL ảnh kế bên nhé.");
    }
  };

  const handleSaveBook = async () => {
    if (!newBook.id || !newBook.title) {
      alert("Vui lòng nhập Mã sách (ID) và Tên sách!");
      return;
    }
    if (!newBook.categoryId) {
      alert("Vui lòng chọn Danh mục cho sách!");
      return;
    }

    // ĐÓNG GÓI DỮ LIỆU ĐẦY ĐỦ CẢ TIẾNG VIỆT VÀ TIẾNG ANH (GIẢI QUYẾT LỖI BỊ MẤT DỮ LIỆU)
    const payload = {
      // Tên biến tiếng Việt (cho an toàn với Entity)
      maSach: newBook.id,
      tenSach: newBook.title,
      tacGia: newBook.author,
      noiDungDemo: newBook.description,
      giaBan: Number(newBook.price) || 0,
      soLuongTon: Number(newBook.stockQuantity) || 0,
      anhSach: newBook.imageUrl,
      maDanhMuc: newBook.categoryId,
      maNhaCungCap: newBook.supplier,
      nguoiDich: newBook.translator,
      nhaXuatBan: newBook.publisher,
      namXuatBan: Number(newBook.publishYear) || 0,
      ngonNgu: newBook.language,
      trongLuong: Number(newBook.weight) || 0,
      kichThuoc: newBook.dimensions,
      soTrang: Number(newBook.pages) || 0,
      hinhThuc: newBook.coverType,
      giamGia: Number(newBook.discount) || 0,

      // Tên biến tiếng Anh (khớp chính xác với DTO của C#)
      id: newBook.id,
      title: newBook.title,
      author: newBook.author,
      description: newBook.description,
      price: Number(newBook.price) || 0,
      stockQuantity: Number(newBook.stockQuantity) || 0,
      imageUrl: newBook.imageUrl,
      categoryId: newBook.categoryId,
      supplier: newBook.supplier,
      discount: Number(newBook.discount) || 0,
      translator: newBook.translator,
      publisher: newBook.publisher,
      publishYear: Number(newBook.publishYear) || 0,
      language: newBook.language,
      weight: Number(newBook.weight) || 0,
      dimensions: newBook.dimensions,
      pages: Number(newBook.pages) || 0,
      coverType: newBook.coverType
    };

    try {
      const url = isEditing ? `http://localhost:5000/api/books/${newBook.id}` : 'http://localhost:5000/api/books';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(isEditing ? "Cập nhật sách thành công!" : "Thêm sách thành công!");
        setShowModal(false);
        fetchBooks(); 
      } else {
        const errData = await response.json().catch(() => ({}));
        alert("Lưu sách thất bại: " + (errData.message || "Vui lòng kiểm tra lại dữ liệu."));
      }
    } catch (error) { 
      console.error("Lỗi kết nối:", error);
      alert("Đã xảy ra lỗi khi kết nối với máy chủ."); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/books/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (response.ok) { alert('Xóa thành công!'); fetchBooks(); } 
      else { alert('Xóa thất bại! Kiểm tra lại quyền Admin hoặc dữ liệu liên quan.'); }
    } catch (error) { console.error("Lỗi xóa sách:", error); }
  };

  const filteredBooks = books.filter(book => {
    const search = searchTerm.toLowerCase();
    return String(book.title || book.TENSACH || '').toLowerCase().includes(search) || String(book.id || book.MASACH || '').toLowerCase().includes(search);
  });

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ padding: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'nowrap' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', whiteSpace: 'nowrap' }}>Quản lý Sách</h2>
        <button onClick={handleOpenAdd} style={{ padding: '8px 16px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: 'max-content', whiteSpace: 'nowrap', display: 'inline-block' }}>
          + Thêm sách mới
        </button>
      </div>

      <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '450px' }}>
        <input type="text" placeholder="Tìm kiếm theo tên sách hoặc mã ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 15px 10px 38px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#888' }}>🔍</span>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f8', textAlign: 'left' }}>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Ảnh</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>ID & Tên Sách</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Giá</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Tồn Kho</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => {
              const bookId = book.id || book.maSach || book.MASACH;
              return (
                <tr key={bookId} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>
                    <img src={book.imageUrl || book.ANHSACH || "https://placehold.co/40x55?text=No+Img"} alt="bìa sách" style={{ width: '40px', height: '55px', objectFit: 'cover' }} />
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '600' }}>{book.title || book.TENSACH}</div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>ID: {bookId}</div>
                  </td>
                  <td style={{ padding: '12px', color: '#e74c3c', fontWeight: 'bold' }}>{Number(book.price || book.GIABAN || 0).toLocaleString('vi-VN')} đ</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{book.stockQuantity ?? book.soLuongTon ?? book.SOLUONGTON ?? 0} cuốn</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleOpenEdit(book)} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', width: 'max-content' }}>Sửa</button>
                      <button onClick={() => handleDelete(bookId)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', width: 'max-content' }}>Xóa</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '650px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #f4f6f8', paddingBottom: '10px' }}>
              {isEditing ? 'Chỉnh sửa thông tin Sách' : 'Thêm sách mới'}
            </h3>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Mã sách (ID)*</label><input style={{ ...inputStyle, backgroundColor: isEditing ? '#f0f0f0' : 'white' }} value={newBook.id} disabled={isEditing} onChange={e => setNewBook({...newBook, id: e.target.value})} /></div>
              <div style={{ flex: 2 }}><label style={labelStyle}>Tên sách*</label><input style={inputStyle} value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} /></div>
            </div>

            <label style={labelStyle}>Tác giả</label><input style={inputStyle} value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
            <label style={labelStyle}>Mô tả ngắn</label><textarea style={{...inputStyle, height: '80px', resize: 'vertical'}} value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} />
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Giá bán (VNĐ)</label>
                <input type="number" style={inputStyle} value={newBook.price === 0 ? '' : newBook.price} onChange={e => setNewBook({...newBook, price: e.target.value === '' ? 0 : Number(e.target.value)})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Giảm giá (%)</label>
                <input type="number" placeholder="VD: 10" style={inputStyle} value={newBook.discount === 0 ? '' : newBook.discount} onChange={e => setNewBook({...newBook, discount: e.target.value === '' ? 0 : Number(e.target.value)})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Số lượng tồn</label>
                <input type="number" style={inputStyle} value={newBook.stockQuantity === 0 ? '' : newBook.stockQuantity} onChange={e => setNewBook({...newBook, stockQuantity: e.target.value === '' ? 0 : Number(e.target.value)})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Ảnh bìa (Tải lên hoặc nhập Link)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, flex: 1, padding: '7px' }} />
                  <input placeholder="Link ảnh URL dự phòng..." style={{ ...inputStyle, flex: 1 }} value={newBook.imageUrl} onChange={e => setNewBook({...newBook, imageUrl: e.target.value})} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Danh mục</label>
                <select style={inputStyle} value={newBook.categoryId} onChange={e => setNewBook({...newBook, categoryId: e.target.value})}>
                  <option value="">-- Chọn danh mục --</option>
                  {danhMucs
                    .filter(cat => {
                      const pId = cat.parentId || cat.parentID || cat.maDanhMucCha || cat.MADANHMUCCHA;
                      return !pId || pId === "";
                    })
                    .map(parentCat => {
                      const pId = parentCat.id || parentCat.maDanhMuc || parentCat.MADANHMUC;
                      const pName = parentCat.name || parentCat.tenDanhMuc || parentCat.TENDANHMUC;

                      const childCats = danhMucs.filter(c => {
                        const childParentId = c.parentId || c.parentID || c.maDanhMucCha || c.MADANHMUCCHA;
                        return childParentId === pId;
                      });

                      return (
                        <React.Fragment key={`group-${pId}`}>
                          <option value={pId} style={{ fontWeight: "bold", color: "#e71a22", backgroundColor: "#fcfcfc" }}>
                            {String(pName).toUpperCase()}
                          </option>
                          {childCats.map(child => {
                            const cId = child.id || child.maDanhMuc || child.MADANHMUC;
                            const cName = child.name || child.tenDanhMuc || child.TENDANHMUC;
                            return (
                              <option key={cId} value={cId} style={{ color: "#333" }}>
                                &nbsp;&nbsp;&nbsp;&nbsp;↳ {cName}
                              </option>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#34495e' }}>Thông tin chi tiết (Bổ sung)</h4>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Nhà cung cấp</label>
                  <select 
                    style={inputStyle} 
                    value={newBook.supplier} 
                    onChange={e => setNewBook({...newBook, supplier: e.target.value})}
                  >
                    <option value="">-- Chọn nhà cung cấp từ kho --</option>
                    {suppliers.map(sup => (
                      <option key={sup.maNhaCungCap} value={sup.maNhaCungCap}>
                        {/* 🌟 ĐÃ SỬA: Hiển thị thêm mã nhà cung cấp */}
                        {sup.tenNhaCungCap} - {sup.maNhaCungCap}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Người dịch</label>
                  <input style={inputStyle} value={newBook.translator} onChange={e => setNewBook({...newBook, translator: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Nhà xuất bản</label><input style={inputStyle} value={newBook.publisher} onChange={e => setNewBook({...newBook, publisher: e.target.value})} /></div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Năm xuất bản</label>
                  <input type="number" style={inputStyle} value={newBook.publishYear === 0 ? '' : newBook.publishYear} onChange={e => setNewBook({...newBook, publishYear: e.target.value === '' ? 0 : Number(e.target.value)})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Trọng lượng (gr)</label>
                  <input type="number" style={inputStyle} value={newBook.weight === 0 ? '' : newBook.weight} onChange={e => setNewBook({...newBook, weight: e.target.value === '' ? 0 : Number(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Kích thước</label><input style={inputStyle} value={newBook.dimensions} onChange={e => setNewBook({...newBook, dimensions: e.target.value})} /></div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Số trang</label>
                  <input type="number" style={inputStyle} value={newBook.pages === 0 ? '' : newBook.pages} onChange={e => setNewBook({...newBook, pages: e.target.value === '' ? 0 : Number(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ngôn ngữ</label><input style={inputStyle} value={newBook.language} onChange={e => setNewBook({...newBook, language: e.target.value})} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Hình thức</label><select style={inputStyle} value={newBook.coverType} onChange={e => setNewBook({...newBook, coverType: e.target.value})}><option value="Bìa Mềm">Bìa Mềm</option><option value="Bìa Cứng">Bìa Cứng</option></select></div>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', backgroundColor: '#ecf0f1', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
              <button onClick={handleSaveBook} style={{ padding: '8px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{isEditing ? 'Cập nhật' : 'Lưu Sách'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;