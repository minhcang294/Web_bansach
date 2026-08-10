using BookStore.API.Helpers;
using BookStore.API.Models.DTOs.Order;
using BookStore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Yêu cầu đăng nhập
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    public OrdersController(IOrderService orderService) => _orderService = orderService;

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
    public async Task<IActionResult> GetMyOrders() => Ok(await _orderService.GetMyOrdersAsync(this.GetUserId()));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var order = await _orderService.GetByIdAsync(this.GetUserId(), id);
        return order is null ? NotFound(new { message = "Không tìm thấy đơn hàng." }) : Ok(order);
    }
}
