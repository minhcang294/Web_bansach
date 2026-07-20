import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { bookApi } from "../api/bookApi.js";
import BookCard from "../components/BookCard.jsx";

export default function BookListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [result, setResult] = useState({ items: [], totalPages: 1, totalItems: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(() => {
    setLoading(true);
    bookApi
      .getAll({ keyword: keyword || undefined, categoryId: categoryId || undefined, page, pageSize: 12 })
      .then((res) => setResult(res.data))
      .finally(() => setLoading(false));
  }, [keyword, categoryId, page]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { bookApi.getCategories().then((res) => setCategories(res.data)); }, []);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.set("page", "1");
    setSearchParams(params);
  };

  const goToPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container" style={{ padding: "40px 20px", minHeight: "70vh" }}>
      <h2 style={{ fontSize: 28, color: "#e60023", marginBottom: 25, borderBottom: "2px solid #eee", paddingBottom: 15 }}>
        {keyword ? `Kết quả cho "${keyword}"` : "Tất cả sách"}
        <span style={{ fontSize: 16, color: "#777", fontWeight: 500, marginLeft: 10 }}>
          ({result.totalItems} cuốn)
        </span>
      </h2>

      {/* THANH DANH MỤC */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
        <button
          type="button"
          style={{
            width: "auto", // Hủy width: 100%
            marginTop: 0,  // Hủy margin-top
            background: !categoryId ? "#e60023" : "white",
            color: !categoryId ? "white" : "#333",
            border: !categoryId ? "1px solid #e60023" : "1px solid #ddd",
            padding: "8px 20px",
            borderRadius: "20px", // Bo tròn dạng viên thuốc
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
            transition: "all 0.2s"
          }}
          onClick={() => updateParam("categoryId", "")}
        >
          Tất cả
        </button>
        
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            style={{
              width: "auto", 
              marginTop: 0,
              background: String(c.id) === categoryId ? "#e60023" : "white",
              color: String(c.id) === categoryId ? "white" : "#333",
              border: String(c.id) === categoryId ? "1px solid #e60023" : "1px solid #ddd",
              padding: "8px 20px",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.2s"
            }}
            onClick={() => updateParam("categoryId", c.id)}
            onMouseOver={(e) => {
              if (String(c.id) !== categoryId) {
                e.currentTarget.style.borderColor = "#e60023";
                e.currentTarget.style.color = "#e60023";
              }
            }}
            onMouseOut={(e) => {
              if (String(c.id) !== categoryId) {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.color = "#333";
              }
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* LƯỚI SẢN PHẨM */}
      {loading ? (
        <p style={{ color: "#777", textAlign: "center", fontSize: "16px", padding: "40px 0" }}>Đang tải dữ liệu...</p>
      ) : result.items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#f9f9f9", borderRadius: "12px" }}>
          <p style={{ fontSize: "18px", color: "#555" }}>Không tìm thấy cuốn sách nào phù hợp.</p>
        </div>
      ) : (
        <>
          <div className="book-grid">
            {result.items.map((b) => <BookCard key={b.id} book={b} />)}
          </div>

          {/* PHÂN TRANG */}
          {result.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "50px" }}>
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  style={{
                    width: "40px",  // Fix kích thước cố định
                    height: "40px",
                    marginTop: 0,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: p === page ? "#e60023" : "white",
                    color: p === page ? "white" : "#333",
                    border: p === page ? "1px solid #e60023" : "1px solid #ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => {
                    if (p !== page) {
                      e.currentTarget.style.borderColor = "#e60023";
                      e.currentTarget.style.color = "#e60023";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (p !== page) {
                      e.currentTarget.style.borderColor = "#ddd";
                      e.currentTarget.style.color = "#333";
                    }
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}