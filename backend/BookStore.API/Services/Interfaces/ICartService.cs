using BookStore.API.Models.DTOs.Cart;

namespace BookStore.API.Services.Interfaces;

public interface ICartService
{
    Task<CartResponseDto> GetCartAsync(string maKhachHang);
    Task<CartResponseDto> AddToCartAsync(string maKhachHang, AddToCartDto dto);
    Task<CartResponseDto> UpdateItemAsync(string maKhachHang, int cartItemId, UpdateCartItemDto dto);
    Task<CartResponseDto> RemoveItemAsync(string maKhachHang, int cartItemId);
}

public class CartException : Exception
{
    public int StatusCode { get; }
    public CartException(string message, int statusCode = 400) : base(message) => StatusCode = statusCode;
}
