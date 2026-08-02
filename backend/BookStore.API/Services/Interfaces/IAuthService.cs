using BookStore.API.Models.DTOs.Auth;

namespace BookStore.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    
    // BỔ SUNG: Hàm thêm mới người dùng dành riêng cho Admin (Hỗ trợ phân quyền Admin/Staff/User)
    Task<AuthResponseDto> CreateUserByAdminAsync(RegisterDto dto);
    
    // Đăng nhập / Đăng ký bằng Google
    Task<AuthResponseDto> GoogleLoginAsync(string email, string name);
    
    // Quản lý người dùng dành cho Admin
    Task<object> GetAllUsersAsync(); 
    Task DeleteUserAsync(string userId);
    Task UpdateUserAsync(string userId, UpdateUserDto dto);

    // Hỗ trợ quên mật khẩu
    Task<bool> EmailExistsAsync(string email);
    Task<bool> ResetPasswordAsync(string email, string newPassword);

    // 👇 BỔ SUNG DÒNG NÀY ĐỂ HẾT LỖI ĐỎ NÚT KHÓA/MỞ KHÓA TÀI KHOẢN
    Task ToggleUserStatusAsync(string userId);
}

// Class Exception để xử lý lỗi nghiệp vụ
public class AuthException : Exception
{
    public int StatusCode { get; }
    public AuthException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}