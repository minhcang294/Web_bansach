import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { bookApi } from "../api/bookApi.js";
import BookCard from "../components/BookCard.jsx";

// =====================================================================
// HÀM TIỆN ÍCH: Tự sinh Slug nếu Backend không trả về Slug
// =====================================================================
const toSlug = (str) => {
  if (!str) return "";
  return str.toString().toLowerCase()
    .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    .replace(/đ/gi, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
};

// =====================================================================
// COMPONENT CON: HIỂN THỊ TỪNG HÀNG SÁCH CHO MỤC CON
// =====================================================================
const SubCategoryRow = React.memo(({ subCategory }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Đọc mã ID chuẩn xác từ Backend C#
  const catId = subCategory.id || subCategory.maDanhMuc || subCategory.MADANHMUC;
  const catName = subCategory.name || subCategory.tenDanhMuc || subCategory.TENDANHMUC;
  const catSlug = subCategory.slug || subCategory.SLUG || toSlug(catName);

  useEffect(() => {
    if (!catId) {
      setLoading(false);
      return; 
    }

    bookApi
      .getAll({ categoryId: catId, page: 1, pageSize: 4 })
      .then((res) => {
        const dataList = res?.data?.items || res?.data || [];
        setBooks(dataList);
      })
      .catch((err) => console.error(`Lỗi tải sách mục ${catName}:`, err))
      .finally(() => setLoading(false));
  }, [catId, catName]);

  if (loading) return <div style={{ padding: "10px 0", color: "#888", fontSize: "14px" }}>Đang tải {catName}...</div>;
  
  if (books.length === 0) {
    return (
      <div style={{ marginBottom: "45px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px", borderBottom: "2px solid #e71a22" }}>
          <h3 style={{ fontSize: "20px", color: "#333", margin: 0, paddingBottom: "8px", textTransform: "uppercase", fontWeight: "700" }}>
            {catName}
          </h3>
        </div>
        <p style={{ color: "#888", fontStyle: "italic", margin: 0 }}>Chưa có sách cho thể loại này.</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "45px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px", borderBottom: "2px solid #e71a22" }}>
        <h3 style={{ fontSize: "20px", color: "#333", margin: 0, paddingBottom: "8px", textTransform: "uppercase", fontWeight: "700" }}>
          {catName}
        </h3>
        <Link 
          to={`/books?category=${catSlug}`} 
          style={{ fontSize: "14px", color: "#e71a22", textDecoration: "none", paddingBottom: "8px", fontWeight: "600" }}
        >
          Xem tất cả &raquo;
        </Link>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "25px" }}>
        {books.map((b) => <BookCard key={b.id || b.maSach || b.MASACH} book={b} />)}
      </div>
    </div>
  );
});

// =====================================================================
// COMPONENT CHÍNH: TRANG DANH SÁCH SÁCH
// =====================================================================
export default function BookListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const keyword = searchParams.get("keyword") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const categorySlug = searchParams.get("category") || ""; 
  const typeParam = searchParams.get("type") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [result, setResult] = useState({ items: [], totalPages: 1, totalItems: 0 });
  const [categories, setCategories] = useState([]);
  const [isCatLoaded, setIsCatLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // GỌI API LẤY TẤT CẢ DANH MỤC TỪ C#
  useEffect(() => {
    bookApi.getCategories()
      .then((res) => {
        setCategories(res?.data || []);
        setIsCatLoaded(true);
      })
      .catch((err) => {
        console.error("Lỗi tải danh mục:", err);
        setIsCatLoaded(true); 
      });
  }, []);

  // =====================================================================
  // LOGIC ĐỘNG: TỰ ĐỘNG PHÂN CẤP DANH MỤC CHA - CON TỪ API
  // =====================================================================
  // 1. Lọc ra các Danh mục lớn (Có parentId rỗng hoặc null)
  const majorCategories = useMemo(() => {
    return categories.filter(c => {
      const pId = c.parentId || c.maDanhMucCha || c.MADANHMUCCHA;
      return !pId; 
    });
  }, [categories]);

  // 2. Lấy nhóm Danh mục con (Nếu đang ở Tab của một Danh mục lớn)
  const currentSubCategories = useMemo(() => {
    if (!categorySlug) return null;
    
    // Tìm danh mục Cha đang được chọn dựa trên Slug
    const currentParentCat = majorCategories.find(c => {
      const cSlug = c.slug || c.SLUG || toSlug(c.name || c.tenDanhMuc || c.TENDANHMUC);
      return cSlug === categorySlug;
    });

    if (!currentParentCat) return null; // Nếu click vào danh mục con thì không trả về gì

    const parentId = currentParentCat.id || currentParentCat.maDanhMuc || currentParentCat.MADANHMUC;

    // Lọc tất cả các danh mục con thuộc về Cha này
    const subCats = categories.filter(c => {
      const pId = c.parentId || c.maDanhMucCha || c.MADANHMUCCHA;
      return pId === parentId;
    });

    return subCats.length > 0 ? subCats : null;
  }, [categorySlug, categories, majorCategories]);

  // =====================================================================

  const fetchBooks = useCallback(() => {
    if (!isCatLoaded) return; 

    // CHỈ chặn gọi API tổng khi đang ở mục LỚN và KHÔNG search keyword
    if (currentSubCategories && !keyword) {
      setLoading(false);
      return;
    }

    setLoading(true);

    let finalCategoryId = categoryId;
    if (categorySlug) {
      // Tìm danh mục đang click (dù là Cha hay Con)
      const matchedCat = categories.find(c => {
        const cSlug = c.slug || c.SLUG || toSlug(c.name || c.tenDanhMuc || c.TENDANHMUC);
        return cSlug === categorySlug;
      });
      if (matchedCat) finalCategoryId = matchedCat.id || matchedCat.maDanhMuc || matchedCat.MADANHMUC;
    }

    bookApi
      .getAll({ 
        keyword: keyword || undefined, 
        categoryId: finalCategoryId || undefined,
        type: typeParam || undefined,
        page, 
        pageSize: 12 
      })
      .then((res) => {
        setResult({
          items: res?.data?.items || res?.data || [],
          totalPages: res?.data?.totalPages || 1,
          totalItems: res?.data?.totalItems || 0
        });
      })
      .catch((err) => console.error("Lỗi fetch books:", err))
      .finally(() => setLoading(false));
  }, [keyword, categoryId, categorySlug, typeParam, page, currentSubCategories, isCatLoaded, categories]);

  useEffect(() => { 
    fetchBooks(); 
  }, [fetchBooks]);

  const getPageTitle = () => {
    if (typeParam === "sale") return "🔥 Khuyến Mãi HOT";
    if (typeParam === "old") return "🏷️ Kho Sách Cũ";
    if (keyword) return `Kết quả tìm kiếm: "${keyword}"`;
    
    if (categorySlug) {
        const matchedCat = categories.find(c => {
            const cSlug = c.slug || c.SLUG || toSlug(c.name || c.tenDanhMuc || c.TENDANHMUC);
            return cSlug === categorySlug;
        });
        return matchedCat ? (matchedCat.name || matchedCat.tenDanhMuc || matchedCat.TENDANHMUC) : "Danh mục sách";
    }
    return "Tất cả sách";
  };

  const updateCategory = (slug) => {
    const params = new URLSearchParams(searchParams);
    params.delete("categoryId");
    params.delete("type");
    params.delete("keyword"); 
    
    if (slug) params.set("category", slug); 
    else params.delete("category");
    
    params.set("page", "1");
    setSearchParams(params);
  };

  const goToPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isAllActive = !categoryId && !categorySlug && !typeParam && !keyword;
  const shouldRenderSubCategories = currentSubCategories && !keyword;

  return (
    <div className="container" style={{ padding: "40px 0", minHeight: "70vh" }}>
      
      {/* KHU VỰC TIÊU ĐỀ */}
      <h2 style={{ fontSize: 28, color: "#e71a22", marginBottom: 25, borderBottom: "2px solid #eee", paddingBottom: 15 }}>
        {getPageTitle()}
        {!shouldRenderSubCategories && (
          <span style={{ fontSize: 16, color: "#777", fontWeight: 500, marginLeft: 10 }}>
            ({result.totalItems || result.items?.length || 0} cuốn)
          </span>
        )}
      </h2>

      {/* THANH DANH MỤC LỚN (TỰ ĐỘNG TỪ BACKEND) */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
        <button
          type="button"
          style={{
            background: isAllActive ? "#e71a22" : "white", 
            color: isAllActive ? "white" : "#333", 
            border: isAllActive ? "1px solid #e71a22" : "1px solid #ddd",
            padding: "8px 24px", 
            borderRadius: "25px", 
            cursor: "pointer", 
            fontWeight: 600, 
            fontSize: "14px", 
            transition: "all 0.2s",
            width: "fit-content",
            display: "inline-block",
            whiteSpace: "nowrap"
          }}
          onClick={() => updateCategory("")}
        >
          Tất cả
        </button>
        
        {majorCategories.map((cat) => {
          const cSlug = cat.slug || cat.SLUG || toSlug(cat.name || cat.tenDanhMuc || cat.TENDANHMUC);
          const cName = cat.name || cat.tenDanhMuc || cat.TENDANHMUC;
          const isActive = cSlug === categorySlug && !keyword;

          return (
            <button
              key={cat.id || cat.maDanhMuc || cat.MADANHMUC} type="button" onClick={() => updateCategory(cSlug)}
              style={{
                background: isActive ? "#e71a22" : "white", 
                color: isActive ? "white" : "#333", 
                border: isActive ? "1px solid #e71a22" : "1px solid #ddd",
                padding: "8px 24px", 
                borderRadius: "25px", 
                cursor: "pointer", 
                fontWeight: 600, 
                fontSize: "14px", 
                transition: "all 0.2s",
                width: "fit-content",
                display: "inline-block",
                whiteSpace: "nowrap"
              }}
            >
              {cName}
            </button>
          )
        })}
      </div>

      {/* KHU VỰC HIỂN THỊ */}
      {loading ? (
        <p style={{ color: "#777", textAlign: "center", fontSize: "16px", padding: "40px 0" }}>Đang tải dữ liệu...</p>
      ) : shouldRenderSubCategories ? (
        
        <div className="grouped-sections">
          {currentSubCategories.map((sub) => {
             const sId = sub.id || sub.maDanhMuc || sub.MADANHMUC;
             return <SubCategoryRow key={sId} subCategory={sub} />;
          })}
        </div>

      ) : result.items.length === 0 ? (
        
        <div style={{ textAlign: "center", padding: "60px 0", background: "#f9f9f9", borderRadius: "12px", border: "1px dashed #ddd" }}>
          <p style={{ fontSize: "18px", color: "#555", fontWeight: "500" }}>Không tìm thấy cuốn sách nào phù hợp.</p>
        </div>

      ) : (
        <>
          <div className="book-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "25px" }}>
            {result.items.map((b) => <BookCard key={b.id || b.maSach || b.MASACH} book={b} />)}
          </div>

          {result.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px", marginTop: "50px" }}>
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p} type="button" onClick={() => goToPage(p)}
                  style={{
                    width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: p === page ? "#e71a22" : "white", color: p === page ? "white" : "#333", border: p === page ? "1px solid #e71a22" : "1px solid #ddd",
                    borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px", transition: "all 0.2s"
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