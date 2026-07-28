namespace BookStore.API.Models.DTOs.Book;

public class BookDto
{
    public string Id { get; set; } = string.Empty;       // MASACH
    public string Title { get; set; } = string.Empty;     // TENSACH
    public string Author { get; set; } = string.Empty;    // TACGIA
    public string Description { get; set; } = string.Empty; // NOIDUNGDEMO
    public decimal Price { get; set; }                    // GIABAN
    
    // [ĐÃ BỔ SUNG]: Trường Giảm giá để hứng % từ Web
    public int Discount { get; set; }                     // GIAMGIA
    
    public int StockQuantity { get; set; }                // SOLUONGTON
    public string ImageUrl { get; set; } = string.Empty;  // ANHSACH
    public string CategoryId { get; set; } = string.Empty;  // MADANHMUC (danh mục chính)
    public string CategoryName { get; set; } = string.Empty;

    // ==========================================
    // CÁC TRƯỜNG THÔNG TIN CHI TIẾT BỔ SUNG
    // ==========================================
    
    // [ĐÃ BỔ SUNG]: Hứng Mã nhà cung cấp (VD: NCC01) để lưu vào khóa ngoại
    public string? MaNhaCungCap { get; set; } 
    
    public string? Supplier { get; set; }     // NHACUNGCAP (Tên nhà cung cấp)
    public string? Translator { get; set; }   // NGUOIDICH
    public string? Publisher { get; set; }    // NHAXUATBAN
    public int? PublishYear { get; set; }     // NAMXUATBAN
    public string? Language { get; set; }     // NGONNGU
    public int? Weight { get; set; }          // TRONGLUONG
    public string? Dimensions { get; set; }   // KICHTHUOC
    public int? Pages { get; set; }           // SOTRANG
    public string? CoverType { get; set; }    // HINHTHUC
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalItems / (double)PageSize);
}