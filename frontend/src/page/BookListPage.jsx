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
    <div className="container page-wrap">
      <h2 className="section-title">
        {keyword ? `Kết quả cho "${keyword}"` : "Tất cả sách"}
        <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500, marginLeft: 10 }}>
          ({result.totalItems} sách)
        </span>
      </h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        <button
          className="btn btn-sm"
          style={{ background: !categoryId ? "var(--macaron-dark)" : "white", color: !categoryId ? "white" : "var(--wine)", border: "1.5px solid var(--border)" }}
          onClick={() => updateParam("categoryId", "")}
        >
          Tất cả
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className="btn btn-sm"
            style={{
              background: String(c.id) === categoryId ? "var(--macaron-dark)" : "white",
              color: String(c.id) === categoryId ? "white" : "var(--wine)",
              border: "1.5px solid var(--border)",
            }}
            onClick={() => updateParam("categoryId", c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Đang tải...</p>
      ) : result.items.length === 0 ? (
        <div className="empty-state">Không tìm thấy cuốn sách nào phù hợp.</div>
      ) : (
        <>
          <div className="book-grid">
            {result.items.map((b) => <BookCard key={b.id} book={b} />)}
          </div>

          {result.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 36 }}>
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className="btn btn-sm"
                  style={{
                    background: p === page ? "var(--macaron-dark)" : "white",
                    color: p === page ? "white" : "var(--wine)",
                    border: "1.5px solid var(--border)",
                    minWidth: 38,
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
