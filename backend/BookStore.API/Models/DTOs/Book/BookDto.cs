namespace BookStore.API.Models.DTOs.Book;

public class BookDto
{
    public string Id { get; set; } = string.Empty;       // MASACH
    public string Title { get; set; } = string.Empty;     // TENSACH
    public string Author { get; set; } = string.Empty;    // TACGIA
    public string Description { get; set; } = string.Empty; // NOIDUNGDEMO
    public decimal Price { get; set; }                    // GIABAN
    public int StockQuantity { get; set; }                // SOLUONGTON
    public string ImageUrl { get; set; } = string.Empty;  // ANHSACH
    public string CategoryId { get; set; } = string.Empty;  // MADANHMUC (danh mục chính)
    public string CategoryName { get; set; } = string.Empty;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalItems / (double)PageSize);
}
