using System.Collections.Generic;
using System.Threading.Tasks;
using BookStore.API.Models.DTOs.Order;

namespace BookStore.API.Services.Interfaces;

public interface IOrderService
{
    // ==========================================
    // API DÀNH CHO KHÁCH HÀNG (FRONTEND)
    // ==========================================
    Task<OrderResponseDto> CreateOrderAsync(string maKhachHang, OrderCreateDto dto);
    
    Task<List<OrderResponseDto>> GetMyOrdersAsync(string maKhachHang);
    
    Task<OrderResponseDto?> GetByIdAsync(string maKhachHang, string orderId);
    
    // ==========================================
    // API DÀNH CHO NHÂN VIÊN & ADMIN (BACKOFFICE)
    // ==========================================
    Task<List<OrderResponseDto>> GetAllOrdersAsync();
    
    Task UpdateStatusAsync(string orderId, string status);
    
    // --- Bổ sung cho Staff Dashboard ---
    Task<OrderDashboardStatDto> GetStaffDashboardStatsAsync();
    
    Task<IEnumerable<OrderSummaryDto>> GetRecentOrdersAsync(string? search, string? status);

    // 🌟 BỔ SUNG QUAN TRỌNG: Hàm lấy chi tiết đơn hàng cho Admin/Staff (Không cần check mã khách hàng)
    Task<OrderResponseDto?> GetByIdForAdminAsync(string orderId);
}