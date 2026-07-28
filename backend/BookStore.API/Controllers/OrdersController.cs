using BookStore.API.Helpers;
using BookStore.API.Models.DTOs.Order;
using BookStore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] OrderCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var order = await _orderService.CreateOrderAsync(this.GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ĐÃ SỬA DÒNG NÀY: Xóa "my-orders" để trả về đường dẫn gốc /api/orders cho lệnh GET
    [HttpGet] 
    public async Task<IActionResult> GetMyOrders() 
    {
        return Ok(await _orderService.GetMyOrdersAsync(this.GetUserId()));
    }

    [HttpGet("all")] 
    [Authorize(Roles = "Admin")] 
    public async Task<IActionResult> GetAllOrdersForAdmin()
    {
        try
        {
            var allOrders = await _orderService.GetAllOrdersAsync();
            return Ok(allOrders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách: " + ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var order = await _orderService.GetByIdAsync(this.GetUserId(), id);
        return order is null ? NotFound(new { message = "Không tìm thấy đơn hàng." }) : Ok(order);
    }

    /// <summary>Cập nhật trạng thái (Admin đổi mọi trạng thái, Khách chỉ được hủy)</summary>
    [HttpPut("{id}/status")]
    // TUYỆT ĐỐI KHÔNG ĐỂ [Authorize(Roles = "Admin")] Ở ĐÂY
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] OrderStatusUpdateDto dto)
    {
        try
        {
            var userId = this.GetUserId();
            var isAdmin = User.IsInRole("Admin");

            // NẾU LÀ KHÁCH HÀNG:
            if (!isAdmin)
            {
                // Kiểm tra trạng thái gửi lên (Dùng OrdinalIgnoreCase để tránh lỗi chữ hoa chữ thường)
                if (string.IsNullOrEmpty(dto.Status) || !dto.Status.Equals("DaHuy", StringComparison.OrdinalIgnoreCase))
                {
                    // Cố tình trả về 400 thay vì 403 để phân biệt với lỗi của hệ thống phân quyền
                    return BadRequest(new { message = $"Bạn chỉ được phép hủy đơn. Dữ liệu bạn gửi lên đang là: '{dto.Status}'" });
                }

                var order = await _orderService.GetByIdAsync(userId, id);
                if (order == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn." });
                }
            }

            await _orderService.UpdateStatusAsync(id, dto.Status);
            return Ok(new { message = "Cập nhật trạng thái thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Lỗi xử lý Backend: " + ex.Message });
        }
    }
}