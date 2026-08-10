using System.ComponentModel.DataAnnotations;

namespace BookStore.API.Models.DTOs.Cart;

public class CartItemDto
{
    public int Id { get; set; }              // MAGIOHANG
    public string BookId { get; set; } = string.Empty; // MASACH
    public string Title { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal => Price * Quantity;
    public int StockQuantity { get; set; }
}

public class CartResponseDto
{
    public List<CartItemDto> Items { get; set; } = new();
    public decimal TotalAmount => Items.Sum(i => i.Subtotal);
    public int TotalQuantity => Items.Sum(i => i.Quantity);
}

public class AddToCartDto
{
    [Required]
    public string BookId { get; set; } = string.Empty;

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemDto
{
    [Range(1, 100)]
    public int Quantity { get; set; }
}
