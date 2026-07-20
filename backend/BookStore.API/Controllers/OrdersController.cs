using BookStore.API.Helpers;
using BookStore.API.Models.DTOs.Order;
using BookStore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Yêu cầu đăng nhập cho tất cả các hành động trong Controller này
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService) 
    {
        _orderService = orderService;
    }

    /// <summary>Tạo đơn hàng từ giỏ hàng hiện tại của user đang đăng nhập.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] OrderCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var order = await _orderService.CreateOrderAsync(this.GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }
        catch (CartException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
    }

    /// <summary>Lịch sử đơn hàng của user đang đăng nhập.</summary>
    [HttpGet]
    public async Task<IActionResult> GetMyOrders() 
    {
        return Ok(await _orderService.GetMyOrdersAsync(this.GetUserId()));
    }

    /// <summary>Lấy tất cả đơn hàng (Dành riêng cho Admin).</summary>
    [HttpGet("all")] 
    [Authorize(Roles = "Admin")] // Chỉ tài khoản có Role là "Admin" mới được phép gọi
    public async Task<IActionResult> GetAllOrdersForAdmin()
    {
        try
        {
            // Gọi hàm từ Service để lấy toàn bộ danh sách đơn hàng
            var allOrders = await _orderService.GetAllOrdersAsync();
            return Ok(allOrders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách đơn hàng: " + ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var order = await _orderService.GetByIdAsync(this.GetUserId(), id);
        return order is null ? NotFound(new { message = "Không tìm thấy đơn hàng." }) : Ok(order);
    }

    /// <summary>Cập nhật trạng thái đơn hàng (Dành cho Admin).</summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] OrderStatusUpdateDto dto)
    {
        try
        {
            await _orderService.UpdateStatusAsync(id, dto.Status);
            return Ok(new { message = "Cập nhật trạng thái thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}