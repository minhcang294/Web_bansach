using BookStore.API.Models.DTOs.Auth;

namespace BookStore.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
}

// Ném ra khi email/mật khẩu sai hoặc email đã tồn tại - Controller sẽ bắt và trả mã lỗi phù hợp
public class AuthException : Exception
{
    public int StatusCode { get; }
    public AuthException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}
