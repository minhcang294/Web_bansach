using System.ComponentModel.DataAnnotations;

namespace BookStore.API.Models.DTOs.Order;

public class OrderCreateDto
{
    [Required(ErrorMessage = "Vui lòng nhập địa chỉ giao hàng")]
    public string ShippingAddress { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string PhoneNumber { get; set; } = string.Empty;
}

public class OrderDetailDto
{
    public string BookTitle { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal => Quantity * UnitPrice;
}

public class OrderResponseDto
{
    public string Id { get; set; } = string.Empty; // MAHOADON
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public List<OrderDetailDto> Items { get; set; } = new();
}
