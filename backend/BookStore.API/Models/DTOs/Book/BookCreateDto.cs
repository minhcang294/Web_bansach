namespace BookStore.API.Models.DTOs.Book;

public class BookCreateDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string CategoryId { get; set; } = string.Empty;

    public int Discount { get; set; } 
    public string? MaNhaCungCap { get; set; } 

    // =====================================
    // ĐÃ BỔ SUNG: Dòng này sẽ sửa lỗi gạch đỏ
    // =====================================
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

    // =====================================
    // ĐÃ BỔ SUNG: Dòng này sẽ sửa lỗi gạch đỏ
    // =====================================
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