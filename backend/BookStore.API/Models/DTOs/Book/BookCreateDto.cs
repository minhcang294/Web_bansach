using System.Text.Json.Serialization;

namespace BookStore.API.Models.DTOs.Book;

public class BookCreateDto
{
    // 🌟 Bọc tất cả các kiểu tên biến mà React có thể gửi lên
    [JsonPropertyName("bookId")]
    public string? BookId { get; set; }

    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("MASACH")]
    public string? MaSach { get; set; }

    // Hàm tự động trích xuất mã do người dùng nhập
    public string GetEffectiveId()
    {
        if (!string.IsNullOrWhiteSpace(BookId)) return BookId.Trim();
        if (!string.IsNullOrWhiteSpace(Id)) return Id.Trim();
        if (!string.IsNullOrWhiteSpace(MaSach)) return MaSach.Trim();
        return string.Empty;
    }

    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string CategoryId { get; set; } = string.Empty;

    public int Discount { get; set; } 
    public string? MaNhaCungCap { get; set; } 
    public string? Supplier { get; set; } 

    public string? Translator { get; set; }
    public string? Publisher { get; set; }
    public int? PublishYear { get; set; }
    public string? Language { get; set; }
    public int? Weight { get; set; }
    public string? Dimensions { get; set; }
    public int? Pages { get; set; }
    public string? CoverType { get; set; }
}

public class BookUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string CategoryId { get; set; } = string.Empty;

    public int Discount { get; set; } 
    public string? MaNhaCungCap { get; set; } 
    public string? Supplier { get; set; } 

    public string? Translator { get; set; }
    public string? Publisher { get; set; }
    public int? PublishYear { get; set; }
    public string? Language { get; set; }
    public int? Weight { get; set; }
    public string? Dimensions { get; set; }
    public int? Pages { get; set; }
    public string? CoverType { get; set; }
}