using BookStore.API.Models.DTOs.Auth;
using BookStore.API.Services.Interfaces;
using BookStore.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")] 
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService, 
        IEmailService emailService, 
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    // ====================================================================
    // API XÁC THỰC CÔNG KHAI
    // ====================================================================

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
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
            return StatusCode(ex.StatusCode, new ApiErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi đăng nhập thường: {Email}", dto.Email);
            return StatusCode(500, new ApiErrorResponse("Đã xảy ra lỗi hệ thống khi đăng nhập."));
        }
    }

    [HttpPost("google-login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        if (string.IsNullOrEmpty(request?.TokenId))
        {
            return BadRequest(new ApiErrorResponse("Token Google không được để trống."));
        }

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new List<string>() { _configuration["GoogleAuth:ClientId"] }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.TokenId, settings);
            
            _logger.LogInformation("Google Login attempt: {Email}", payload.Email);
            var result = await _authService.GoogleLoginAsync(payload.Email, payload.Name);

            return Ok(result);
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "Google Token không hợp lệ.");
            return BadRequest(new ApiErrorResponse("Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn."));
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new ApiErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống đăng nhập Google.");
            return StatusCode(500, new ApiErrorResponse("Lỗi hệ thống khi xử lý đăng nhập Google."));
        }
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _authService.RegisterAsync(dto);
            return StatusCode(201, result); // Sửa lỗi 21 thành 201
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new ApiErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi đăng ký User: {Email}", dto.Email);
            return StatusCode(500, new ApiErrorResponse("Đã xảy ra lỗi không xác định khi đăng ký."));
        }
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
    {
        if (request == null || string.IsNullOrEmpty(request.Email))
            return BadRequest(new ApiErrorResponse("Email không được để trống."));
        
        var userExists = await _authService.EmailExistsAsync(request.Email);
        
        if (!userExists)
        {
            _logger.LogWarning("Forgot password requested for non-existent email: {Email}", request.Email);
            return Ok(new { message = "Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục mật khẩu đã được gửi." });
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
            return Ok(new { message = "Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục mật khẩu đã được gửi." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xử lý quên mật khẩu cho: {Email}", request.Email);
            return StatusCode(500, new ApiErrorResponse("Lỗi hệ thống khi xử lý yêu cầu khôi phục mật khẩu."));
        }
    }


    // ====================================================================
    // API QUẢN LÝ NGƯỜI DÙNG (YÊU CẦU QUYỀN ADMIN / STAFF)
    // ====================================================================

    [HttpGet("users")]
    [Authorize(Roles = "Admin,Staff")] 
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllUsers()
    {
        // Trở về hàm GetAllUsersAsync() trả về object như Interface cũ của bạn
        var users = await _authService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpDelete("users/{id}")]
    [Authorize(Roles = "Admin")] 
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            await _authService.DeleteUserAsync(id);
            return Ok(new { message = "Xóa người dùng thành công." });
        }
        catch (AuthException ex)
        {
             return StatusCode(ex.StatusCode, new ApiErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin lỗi khi xóa user ID: {Id}", id);
            return StatusCode(500, new ApiErrorResponse("Lỗi hệ thống khi xóa người dùng."));
        }
    }

    [HttpPut("users/{id}")]
    [Authorize(Roles = "Admin,Staff")] 
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            await _authService.UpdateUserAsync(id, dto);
            return Ok(new { message = "Cập nhật thông tin người dùng thành công." });
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new ApiErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi Admin cập nhật user ID: {Id}", id);
            return StatusCode(500, new ApiErrorResponse("Lỗi hệ thống khi cập nhật người dùng."));
        }
    }

    [HttpPost("users")]
    [Authorize(Roles = "Admin,Staff")] 
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUser([FromBody] RegisterDto dto) // Khôi phục lại RegisterDto cho chuẩn với IAuthService
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _authService.CreateUserByAdminAsync(dto);
            return StatusCode(201, result); // Sửa lỗi số 21 thành 201
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new ApiErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi Admin thêm user mới: {Email}", dto.Email);
            return StatusCode(500, new ApiErrorResponse("Lỗi hệ thống khi thêm người dùng mới."));
        }
    }

    [HttpPut("users/{id}/status")] // Chỉnh lại đường dẫn cho khớp Frontend (bỏ chữ toggle-)
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> ToggleUserStatus(string id)
    {
        try 
        {
            await _authService.ToggleUserStatusAsync(id);
            return Ok(new { message = "Cập nhật trạng thái tài khoản thành công." });
        }
        catch (AuthException ex)
        {
            return StatusCode(ex.StatusCode, new ApiErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi thay đổi status user ID: {Id}", id);
            return StatusCode(500, new ApiErrorResponse("Lỗi hệ thống."));
        }
    }
}

// Class hỗ trợ trả về thông báo lỗi chuẩn
public class ApiErrorResponse 
{
    public string Message { get; set; }
    public ApiErrorResponse(string message) { Message = message; }
}