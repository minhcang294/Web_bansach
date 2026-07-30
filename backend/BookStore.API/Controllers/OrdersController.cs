using BookStore.API.Helpers;
using BookStore.API.Models.DTOs.Order;
using BookStore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService) 
    {
        _orderService = orderService;
    }

    // ==========================================
    // API DÀNH CHO KHÁCH HÀNG
    // ==========================================

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] OrderCreateDto dto)
    {
        if (!ModelState.IsValid) 
            return BadRequest(ModelState);

        try
        {
            // Truyền toàn bộ dto (đã có Tên, Email, SĐT, Địa chỉ, PTTT, Ghi chú) sang Service
            var order = await _orderService.CreateOrderAsync(this.GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet] 
    public async Task<IActionResult> GetMyOrders() 
    {
        try 
        {
            var myOrders = await _orderService.GetMyOrdersAsync(this.GetUserId());
            return Ok(myOrders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách đơn hàng: " + ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        try
        {
            var userId = this.GetUserId();
            var isAdminOrStaff = User.IsInRole("Admin") || User.IsInRole("Staff");

            OrderResponseDto? order;

            if (isAdminOrStaff)
            {
                order = await _orderService.GetByIdForAdminAsync(id);
            }
            else
            {
                order = await _orderService.GetByIdAsync(userId, id);
            }

            return order is null 
                ? NotFound(new { message = "Không tìm thấy đơn hàng." }) 
                : Ok(order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy chi tiết: " + ex.Message });
        }
    }

    // ==========================================
    // API DÀNH CHO ADMIN VÀ STAFF
    // ==========================================

    [HttpGet("staff-stats")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetStaffStats()
    {
        try
        {
            var stats = await _orderService.GetStaffDashboardStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi lấy thống kê: " + ex.Message });
        }
    }

    [HttpGet("recent")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetRecentOrders([FromQuery] string? search, [FromQuery] string? status)
    {
        try
        {
            var orders = await _orderService.GetRecentOrdersAsync(search, status);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi lấy đơn hàng gần đây: " + ex.Message });
        }
    }

    [HttpGet("all")] 
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllOrdersForAdmin()
    {
        try
        {
            var allOrders = await _orderService.GetAllOrdersAsync();
            return Ok(allOrders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách toàn bộ đơn hàng: " + ex.Message });
        }
    }

    // ==========================================
    // API CẬP NHẬT TRẠNG THÁI & HỦY ĐƠN
    // ==========================================

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] object rawDto)
    {
        try
        {
            var userId = this.GetUserId();
            var isAdminOrStaff = User.IsInRole("Admin") || User.IsInRole("Staff");

            // 1. Kiểm tra đơn hàng có tồn tại và thuộc quyền truy cập không
            var currentOrder = isAdminOrStaff 
                ? await _orderService.GetByIdForAdminAsync(id) 
                : await _orderService.GetByIdAsync(userId, id);

            if (currentOrder == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn." });
            }

            // 2. Chặn thay đổi nếu đơn hàng đã bị hủy
            string currentStatusCheck = currentOrder.Status?.Trim() ?? "";
            if (currentStatusCheck == "Đã hủy" || currentStatusCheck == "DaHuy")
            {
                return BadRequest(new { message = "Đơn hàng này đã ở trạng thái 'Đã hủy', không thể thay đổi trạng thái." });
            }

            string finalStatus = "Đã hủy"; // Mặc định dành cho Khách hàng (chỉ có quyền hủy)

            if (isAdminOrStaff)
            {
                // Xử lý dynamic body cho Admin/Staff vì đôi lúc gửi dạng string, đôi lúc gửi object
                if (rawDto is JsonElement jsonElement)
                {
                    if (jsonElement.ValueKind == JsonValueKind.Object && 
                       (jsonElement.TryGetProperty("status", out var val) || jsonElement.TryGetProperty("Status", out val)))
                    {
                        finalStatus = val.GetString() ?? currentOrder.Status;
                    }
                    else if (jsonElement.ValueKind == JsonValueKind.String)
                    {
                        finalStatus = jsonElement.GetString() ?? currentOrder.Status;
                    }
                }
                else if (rawDto is UpdateOrderStatusDto dtoObj && !string.IsNullOrEmpty(dtoObj.Status))
                {
                    finalStatus = dtoObj.Status;
                }
                else
                {
                    finalStatus = currentOrder.Status;
                }
            }
            else 
            {
                // Khách hàng: Chỉ cho phép Hủy nếu đơn đang "Chờ xử lý"
                bool isPending = currentStatusCheck == "Chờ xử lý" || currentStatusCheck == "ChoXuLy" || currentStatusCheck.Equals("Chờ xử lý", StringComparison.OrdinalIgnoreCase);

                if (!isPending)
                {
                    return BadRequest(new { message = "Chỉ có thể hủy đơn hàng khi đang ở trạng thái 'Chờ xử lý'." });
                }
            }

            // 3. Gọi Service thực thi cập nhật Database
            await _orderService.UpdateStatusAsync(id, finalStatus);
            return Ok(new { message = "Cập nhật trạng thái thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi xử lý cập nhật trạng thái: " + ex.Message });
        }
    }
}