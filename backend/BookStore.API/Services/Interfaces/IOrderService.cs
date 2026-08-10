using BookStore.API.Models.DTOs.Order;

namespace BookStore.API.Services.Interfaces;

public interface IOrderService
{
    Task<OrderResponseDto> CreateOrderAsync(string maKhachHang, OrderCreateDto dto);
    Task<List<OrderResponseDto>> GetMyOrdersAsync(string maKhachHang);
    Task<OrderResponseDto?> GetByIdAsync(string maKhachHang, string orderId);
}
