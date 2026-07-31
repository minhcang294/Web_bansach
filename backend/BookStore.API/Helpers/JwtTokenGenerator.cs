using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace BookStore.API.Helpers;

public class JwtTokenGenerator
{
    private readonly IConfiguration _config;
    
    public JwtTokenGenerator(IConfiguration config)
    {
        _config = config;
    }

    // ====================================================================
    // TOKEN ĐĂNG NHẬP CHÍNH (XÁC THỰC & PHÂN QUYỀN)
    // ====================================================================
    public (string token, DateTime expiresAt) GenerateToken(string userId, string email, string fullName, string role)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]!;
        var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");
        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var claims = new List<Claim>
        {
            // ⭐ ĐÃ SỬA: Dùng ClaimTypes.NameIdentifier để API Giỏ hàng (Cart) nhận ra User -> Trị lỗi 401
            new Claim(ClaimTypes.NameIdentifier, userId), 
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, fullName),
            // ⭐ ĐÃ SỬA: Dùng ClaimTypes.Role để API Admin nhận ra quyền phân cấp -> Trị lỗi 403
            new Claim(ClaimTypes.Role, string.IsNullOrEmpty(role) ? "Staff" : role), 
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    // ====================================================================
    // TOKEN ĐẶT LẠI MẬT KHẨU (THỜI GIAN NGẮN HẠN)
    // ====================================================================
    public string GenerateResetToken(string email)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]!;
        var expiresAt = DateTime.UtcNow.AddMinutes(15); // Chỉ có hiệu lực trong 15 phút

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, email), // Đồng bộ dùng ClaimTypes
            new Claim("purpose", "password_reset"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // ====================================================================
    // KIỂM TRA TÍNH HỢP LỆ CỦA TOKEN ĐẶT LẠI MẬT KHẨU
    // ====================================================================
    public string? ValidateResetTokenAndGetEmail(string token)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]!;
        var handler = new JwtSecurityTokenHandler();

        try
        {
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"],
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ValidateLifetime = true // Đảm bảo token chưa hết hạn (chưa qua 15 phút)
            }, out _);

            // Kiểm tra xem token này có đúng mục đích là reset password không
            var purpose = principal.FindFirst("purpose")?.Value;
            if (purpose != "password_reset") return null;

            return principal.FindFirst(ClaimTypes.Email)?.Value;
        }
        catch
        {
            // Bất kỳ lỗi nào (sai chữ ký, hết hạn, giả mạo) đều trả về null
            return null;
        }
    }
}