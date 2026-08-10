using BookStore.API.Helpers;
using BookStore.API.Models.DTOs.Cart;
using BookStore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Toàn bộ Controller này yêu cầu đăng nhập (JWT)
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    public CartController(ICartService cartService) => _cartService = cartService;

    /// <summary>Xem giỏ hàng hiện tại của người dùng đang đăng nhập.</summary>
    [HttpGet]
    public async Task<IActionResult> GetCart() => Ok(await _cartService.GetCartAsync(this.GetUserId()));

    /// <summary>Thêm sách vào giỏ hàng (cộng dồn số lượng nếu đã có trong giỏ).</summary>
    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            return Ok(await _cartService.AddToCartAsync(this.GetUserId(), dto));
        }
        catch (CartException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
    }

    /// <summary>Cập nhật số lượng 1 sản phẩm trong giỏ hàng.</summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateCartItemDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            return Ok(await _cartService.UpdateItemAsync(this.GetUserId(), id, dto));
        }
        catch (CartException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
    }

    /// <summary>Xóa 1 sản phẩm khỏi giỏ hàng.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> RemoveItem(int id)
    {
        try
        {
            return Ok(await _cartService.RemoveItemAsync(this.GetUserId(), id));
        }
        catch (CartException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
    }
}
