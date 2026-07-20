import React, { useState, useEffect } from 'react';

// Đưa các giá trị mặc định ra ngoài component để tối ưu bộ nhớ
const initialBookState = {
  id: '',
  title: '',
  author: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  imageUrl: '',
  categoryId: ''
};

const inputStyle = {
  width: '100%', 
  marginBottom: '15px', 
  padding: '10px', 
  border: '1px solid #ccc', 
  borderRadius: '4px',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
};

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [danhMucs, setDanhMucs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBook, setNewBook] = useState(initialBookState);

  // Hàm lấy token động, đảm bảo luôn lấy token mới nhất khi gọi API
  const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Chạy song song 2 API để tối ưu tốc độ tải trang
  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchBooks(), fetchDanhMucs()]);
    setLoading(false);
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data.items || data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sách:", error);
    }
  };

  const fetchDanhMucs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories'); 
      if (response.ok) {
        const data = await response.json();
        setDanhMucs(data || []);
        
        // Gán giá trị categoryId mặc định là mục đầu tiên khi load xong
        if (data && data.length > 0) {
          setNewBook(prev => ({ ...prev, categoryId: data[0].maDanhMuc || data[0].id }));
        }
      }
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.id || !newBook.title) {
      alert("Vui lòng nhập Mã sách (ID) và Tên sách!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(newBook)
      });

      if (response.ok) {
        alert("Thêm sách thành công!");
        closeModal();
        fetchBooks(); 
      } else {
        const errorData = await response.text();
        console.error("Chi tiết lỗi từ Server:", errorData);
        alert("Thêm sách thất bại. Vui lòng kiểm tra Console để xem chi tiết!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Đã xảy ra lỗi khi kết nối với máy chủ.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        alert('Xóa thành công!');
        fetchBooks();
      } else {
        alert('Xóa thất bại! Kiểm tra lại quyền Admin hoặc dữ liệu liên quan.');
      }
    } catch (error) {
      console.error("Lỗi xóa sách:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNewBook({
      ...initialBookState,
      categoryId: danhMucs.length > 0 ? (danhMucs[0].maDanhMuc || danhMucs[0].id) : ''
    });
  };

  if (loading) {
    return <div style={{ padding: '20px', fontSize: '18px', color: '#2c3e50' }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      
      {/* ================= HEADER QUẢN LÝ SÁCH ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Quản lý Sách</h2>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#2ecc71', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            width: 'max-content',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          + Thêm sách mới
        </button>
      </div>

      {/* ================= BẢNG DANH SÁCH ================= */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f8', textAlign: 'left' }}>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>ID</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Tên Sách</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Tác Giả</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Giá</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Tồn Kho</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? books.map((book) => {
              const stock = book.stockQuantity ?? book.soLuongTon ?? 0;
              return (
                <tr key={book.id || book.maSach} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{book.id || book.maSach}</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{book.title || book.tenSach}</td>
                  <td style={{ padding: '12px' }}>{book.author || book.tacGia}</td>
                  <td style={{ padding: '12px', color: '#e74c3c', fontWeight: 'bold' }}>
                    {book.price ? book.price.toLocaleString('vi-VN') : (book.giaBan ? book.giaBan.toLocaleString('vi-VN') : 0)} đ
                  </td>
                  {/* CỘT TỒN KHO CÓ LOGIC MÀU SẮC */}
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontWeight: 'bold',
                      color: stock < 5 ? '#e74c3c' : '#27ae60',
                      backgroundColor: stock < 5 ? '#fdedec' : '#eafaf1'
                    }}>
                      {stock}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(book.id || book.maSach)} 
                      style={{ 
                        backgroundColor: '#e74c3c', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '4px', 
                        cursor: 'pointer', 
                        transition: '0.2s',
                        width: 'max-content',
                        display: 'inline-block'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#7f8c8d' }}>
                  Chưa có dữ liệu sách.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL THÊM SÁCH ================= */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #f4f6f8', paddingBottom: '10px' }}>
              Thêm sách mới
            </h3>
            
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Mã sách (ID)*</label>
            <input placeholder="Nhập ID sách (VD: S016)..." style={inputStyle} value={newBook.id} onChange={e => setNewBook({...newBook, id: e.target.value})} />
            
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Tên sách*</label>
            <input placeholder="Nhập tên sách..." style={inputStyle} value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
            
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Tác giả</label>
            <input placeholder="Nhập tên tác giả..." style={inputStyle} value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
            
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Mô tả ngắn</label>
            <textarea placeholder="Nhập mô tả nội dung..." style={{...inputStyle, height: '80px', resize: 'vertical'}} value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} />
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Giá bán (VNĐ)</label>
                <input type="number" placeholder="0" min="0" style={inputStyle} value={newBook.price} onChange={e => setNewBook({...newBook, price: Number(e.target.value)})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Số lượng tồn</label>
                <input type="number" placeholder="0" min="0" style={inputStyle} value={newBook.stockQuantity} onChange={e => setNewBook({...newBook, stockQuantity: Number(e.target.value)})} />
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Link ảnh bìa (URL)</label>
            <input placeholder="Gắn link URL ảnh (tối đa 500 ký tự)..." style={inputStyle} value={newBook.imageUrl} onChange={e => setNewBook({...newBook, imageUrl: e.target.value})} />
            
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Danh mục</label>
            <select 
              style={inputStyle} 
              value={newBook.categoryId}
              onChange={e => setNewBook({...newBook, categoryId: e.target.value})}
            >
              {danhMucs.length > 0 ? danhMucs.map(dm => (
                <option key={dm.maDanhMuc || dm.id} value={dm.maDanhMuc || dm.id}>
                  {dm.tenDanhMuc || dm.name}
                </option>
              )) : <option value="">Đang tải danh mục...</option>}
            </select>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={closeModal} 
                style={{ padding: '10px 20px', backgroundColor: '#ecf0f1', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', width: 'max-content' }}
              >
                Hủy
              </button>
              <button 
                onClick={handleAddBook} 
                style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', width: 'max-content' }}
              >
                Lưu Sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;