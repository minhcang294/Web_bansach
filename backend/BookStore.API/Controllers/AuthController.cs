using BookStore.API.Models.DTOs.Auth;
using BookStore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookStore.API.Services.Implementations;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;

    // ĐÃ SỬA LỖI Ở DÒNG NÀY: Thêm IEmailService emailService vào tham số
    public AuthController(IAuthService authService, IEmailService emailService)
    {
        _authService = authService;
        _emailService = emailService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (AuthException ex) // Ưu tiên bắt lỗi đặc thù trước
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống." });
        }
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), 201)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _authService.RegisterAsync(dto);
            return StatusCode(201, result);
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi đăng ký." });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
    {
        if (string.IsNullOrEmpty(request.Email))
            return BadRequest("Email không được để trống.");
        var userExists = true; // Giả sử email có tồn tại
        
        if (!userExists)
        {
            return BadRequest("Email không tồn tại trong hệ thống.");
        }
        string resetToken = Guid.NewGuid().ToString(); 
        string resetLink = $"http://localhost:3000/reset-password?email={request.Email}&token={resetToken}";
        string emailSubject = "Yêu cầu khôi phục mật khẩu - Hệ Thống Bán Sách";
        string emailBody = $@"
            <h3>Xin chào!</h3>
            <p>Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng click vào đường dẫn bên dưới để tạo mật khẩu mới:</p>
            <a href='{resetLink}' style='display:inline-block; padding:10px 20px; background-color:#3498db; color:white; text-decoration:none; border-radius:5px;'>Đặt lại mật khẩu</a>
            <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
            <p>Trân trọng!</p>";

        try
        {
            await _emailService.SendEmailAsync(request.Email, emailSubject, emailBody);
            return Ok(new { message = "Email khôi phục đã được gửi thành công." });
        }
        catch (Exception ex)
        {
            // Ghi log lỗi nếu cần thiết
            return StatusCode(500, "Lỗi khi gửi email: " + ex.Message);
        }
    }

    // ====================================================================
    // API QUẢN LÝ NGƯỜI DÙNG (ADMIN)
    // ====================================================================

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _authService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpDelete("users/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            await _authService.DeleteUserAsync(id);
            return Ok(new { message = "Xóa người dùng thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}