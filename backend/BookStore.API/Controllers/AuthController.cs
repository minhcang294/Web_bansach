using BookStore.API.Models.DTOs.Auth;
using BookStore.API.Services.Interfaces;
using BookStore.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth; 
using Microsoft.Extensions.Configuration; 

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, IEmailService emailService, IConfiguration configuration)
    {
        _authService = authService;
        _emailService = emailService;
        _configuration = configuration;
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
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống." });
        }
    }

    [HttpPost("google-login")]
    [ProducesResponseType(typeof(AuthResponseDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        if (string.IsNullOrEmpty(request?.TokenId))
        {
            return BadRequest(new { message = "Token Google không được để trống." });
        }

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new List<string>() { _configuration["GoogleAuth:ClientId"] }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.TokenId, settings);
            
            string userEmail = payload.Email;
            string userName = payload.Name;

            var result = await _authService.GoogleLoginAsync(userEmail, userName);

            return Ok(result);
        }
        catch (InvalidJwtException)
        {
            return BadRequest(new { message = "Token Google không hợp lệ hoặc đã bị chỉnh sửa." });
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi đăng nhập Google: " + ex.Message });
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
        if (request == null || string.IsNullOrEmpty(request.Email))
            return BadRequest(new { message = "Email không được để trống." });
        
        var userExists = await _authService.EmailExistsAsync(request.Email);
        
        if (!userExists)
        {
            return BadRequest(new { message = "Email không tồn tại trong hệ thống." });
        }
        
        string resetToken = Guid.NewGuid().ToString(); 
        string resetLink = $"http://localhost:3000/reset-password?email={request.Email}&token={resetToken}";
        string emailSubject = "Yêu cầu khôi phục mật khẩu - BookGalaxy";
        string emailBody = $@"
            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                <h2 style='color: #e74c3c;'>BookGalaxy</h2>
                <h3>Xin chào!</h3>
                <p>Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng click vào đường dẫn bên dưới để tạo mật khẩu mới:</p>
                <a href='{resetLink}' style='display:inline-block; padding:10px 20px; background-color:#3498db; color:white; text-decoration:none; border-radius:5px; font-weight:bold;'>Đặt lại mật khẩu</a>
                <p style='margin-top: 20px; color: #64748b;'>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
                <p>Trân trọng!</p>
            </div>";

        try
        {
            await _emailService.SendEmailAsync(request.Email, emailSubject, emailBody);
            return Ok(new { message = "Email khôi phục đã được gửi thành công." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi gửi email: " + ex.Message });
        }
    }

    // ====================================================================
    // API QUẢN LÝ NGƯỜI DÙNG (ADMIN / STAFF)
    // ====================================================================

    [HttpGet("users")]
    [Authorize(Roles = "Admin,Staff")] 
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _authService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpDelete("users/{id}")]
    [Authorize(Roles = "Admin,Staff")] 
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

    [HttpPut("users/{id}")]
    [Authorize(Roles = "Admin,Staff")] 
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        if (!ModelState.IsValid) 
            return BadRequest(ModelState);

        try
        {
            await _authService.UpdateUserAsync(id, dto);
            return Ok(new { message = "Cập nhật người dùng thành công." });
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi cập nhật: " + ex.Message });
        }
    }

    [HttpPost("users")]
    [Authorize(Roles = "Admin,Staff")] 
    public async Task<IActionResult> CreateUser([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) 
            return BadRequest(ModelState);

        try
        {
            var result = await _authService.CreateUserByAdminAsync(dto);
            return StatusCode(201, result);
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống khi thêm người dùng: " + ex.Message });
        }
    }
}