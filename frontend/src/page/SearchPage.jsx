import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { bookApi } from "../api/bookApi.js"; 

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || ""; 
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tự động gọi API mỗi khi từ khóa trên URL thay đổi
  useEffect(() => {
    if (keyword.trim()) {
      fetchSearchResults(keyword);
    } else {
      setBooks([]); // Nếu xóa trắng URL thì làm rỗng danh sách
    }
  }, [keyword]);

  const fetchSearchResults = async (searchWord) => {
    setLoading(true);
    setError(""); // Reset lỗi trước khi tìm
    try {
      // GỌI API BACKEND
      const response = await bookApi.searchBooks(searchWord);
      
      // IN RA CONSOLE ĐỂ KIỂM TRA DỮ LIỆU THẬT (Bấm F12 -> Console để xem)
      console.log("Dữ liệu Backend C# trả về:", response.data); 
      
      // BÓC TÁCH DỮ LIỆU AN TOÀN TỐI ĐA
      let data = [];
      if (Array.isArray(response.data)) {
        // Trường hợp Backend trả về trực tiếp mảng: [...]
        data = response.data; 
      } else if (response.data && Array.isArray(response.data.items)) {
        // Trường hợp Backend trả về PagedResult: { items: [...], totalItems: X }
        data = response.data.items;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Trường hợp bọc trong data: { data: [...] }
        data = response.data.data;
      }
      
      setBooks(data);
      
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
      setError("Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", minHeight: "60vh" }}>
      <h2 style={{ borderBottom: "2px solid #e71a22", paddingBottom: "10px", display: "inline-block" }}>
        Kết quả tìm kiếm cho: <strong style={{ color: "#e71a22" }}>"{keyword}"</strong>
      </h2>
      
      {loading ? (
        <div style={{ padding: "50px 0", textAlign: "center", fontSize: "16px" }}>Đang tìm kiếm...</div>
      ) : error ? (
        <div style={{ padding: "20px 0", color: "red", textAlign: "center" }}>{error}</div>
      ) : books.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '20px', 
          marginTop: '30px' 
        }}>
          {/* Lặp qua danh sách sách và hiển thị */}
          {books.map((book) => (
            <div key={book.id || book.maSach} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '15px', 
              textAlign: 'center', 
              backgroundColor: '#fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <Link to={`/books/${book.id || book.maSach}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img 
                  // Ưu tiên imageUrl (Từ BookDto trả về) hoặc hinhAnh
                  src={book.imageUrl || book.hinhAnh || "https://via.placeholder.com/220x300?text=No+Image"} 
                  alt={book.title || book.tenSach} 
                  style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '4px' }} 
                />
                <h3 style={{ 
                  fontSize: '16px', 
                  margin: '15px 0 10px', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden' 
                }}>
                  {book.title || book.tenSach}
                </h3>
                <p style={{ color: '#e71a22', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>
                  {(book.price || book.giaBia || 0).toLocaleString()} đ
                </p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "50px 0", textAlign: "center", color: "#666", fontSize: "16px" }}>
          Không tìm thấy quyển sách nào phù hợp với từ khóa trên.
        </div>
      )}
    </div>
  );
}