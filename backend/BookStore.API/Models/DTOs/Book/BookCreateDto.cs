using System.ComponentModel.DataAnnotations;

namespace BookStore.API.Models.DTOs.Book;

public class BookCreateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Author { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    [Required]
    public string CategoryId { get; set; } = string.Empty; // MADANHMUC
}

public class BookUpdateDto : BookCreateDto { }
