using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BookStore.API.Models.DTOs.Order;

// ==========================================
// DTO DÀNH CHO KHÁCH HÀNG (FRONTEND)
// ==========================================
public class OrderCreateDto
{
    // BỔ SUNG CÁC TRƯỜNG TỪ TRANG CHECKOUT
    [Required(ErrorMessage = "Vui lòng nhập họ và tên người nhận")]
    public string CustomerName { get; set; } = string.Empty;

    public string? Email { get; set; }

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập địa chỉ giao hàng")]
    public string ShippingAddress { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = "COD";

    public string? Note { get; set; }
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
    
    // BỔ SUNG CÁC TRƯỜNG ĐỂ TRANG ADMIN/NHÂN VIÊN CÓ THÔNG TIN IN HÓA ĐƠN
    public string CustomerName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Note { get; set; }
    
    public string ShippingAddress { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    
    public List<OrderDetailDto> Items { get; set; } = new();
}

// ==========================================
// DTO DÀNH CHO NHÂN VIÊN & ADMIN (BACKOFFICE)
// ==========================================
public class OrderSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ItemSummary { get; set; } = string.Empty; // Ví dụ: "Đắc Nhân Tâm (+2)"
    public decimal Total { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
}

public class OrderDashboardStatDto
{
    public int PendingOrders { get; set; } // Đơn chờ xử lý
    public int ShippingOrders { get; set; } // Đơn đang giao
    public int CompletedToday { get; set; } // Đơn hoàn tất trong ngày
    public int LowStockBooks { get; set; } // Số lượng đầu sách sắp hết (<5)
}

public class UpdateOrderStatusDto
{
    [Required(ErrorMessage = "Trạng thái không được để trống")]
    public string Status { get; set; } = string.Empty; 
}