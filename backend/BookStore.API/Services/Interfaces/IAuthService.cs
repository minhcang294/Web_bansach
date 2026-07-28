using BookStore.API.Models.DTOs.Auth;

namespace BookStore.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    
    // Thêm hàm GoogleLoginAsync để hỗ trợ xác thực và tạo token khi đăng nhập bằng Google
    Task<AuthResponseDto> GoogleLoginAsync(string email, string name);
    
    // Các hàm quản lý người dùng dành cho Admin
    Task<object> GetAllUsersAsync(); 
    Task DeleteUserAsync(string userId);
}

// Class Exception để xử lý lỗi nghiệp vụ (ĐỂ RIÊNG BIỆT)
public class AuthException : Exception
{
    public int StatusCode { get; }
    public AuthException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}