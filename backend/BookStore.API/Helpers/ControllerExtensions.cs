using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Helpers;

public static class ControllerExtensions
{
    // Lấy mã khách hàng (MAKHACHHANG) từ claim "sub" trong JWT - dạng string vì PK trong DB là varchar
    public static string GetUserId(this ControllerBase controller)
    {
        var subClaim = controller.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? controller.User.FindFirst("sub")?.Value
            ?? controller.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        return subClaim ?? throw new UnauthorizedAccessException("Không xác định được người dùng.");
    }
}
