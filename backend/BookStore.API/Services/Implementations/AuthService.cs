using BookStore.API.Helpers;
using BookStore.API.Models.DTOs.Auth;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using BookStore.API.Services.Interfaces;

namespace BookStore.API.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IKhachHangRepository _khachHangRepository;
    private readonly INhanVienRepository _nhanVienRepository;
    private readonly JwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        IKhachHangRepository khachHangRepository,
        INhanVienRepository nhanVienRepository,
        JwtTokenGenerator jwtTokenGenerator)
    {
        _khachHangRepository = khachHangRepository;
        _nhanVienRepository = nhanVienRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        // 1. Kiểm tra Nhân viên/Admin
        var nhanVien = await _nhanVienRepository.GetByEmailAsync(dto.Email);
        if (nhanVien != null && IsPasswordMatch(dto.Password, nhanVien.MatKhau))
        {
            if (nhanVien.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            
            string role = !string.IsNullOrWhiteSpace(nhanVien.Role) ? nhanVien.Role : 
                          (!string.IsNullOrWhiteSpace(nhanVien.VaiTroPhuTrach) ? nhanVien.VaiTroPhuTrach : "Staff");
            
            return BuildAuthResponse(nhanVien.MaNhanVien, nhanVien.Email, nhanVien.TenNv ?? "Admin", role);
        }

        // 2. Kiểm tra Khách hàng
        var khachHang = await _khachHangRepository.GetByEmailAsync(dto.Email);
        if (khachHang != null && IsPasswordMatch(dto.Password, khachHang.MatKhau))
        {
            if (khachHang.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            return BuildAuthResponse(khachHang.MaKhachHang, khachHang.Email, khachHang.HoTenKh ?? "Khách hàng", "Customer");
        }

        throw new AuthException("Email hoặc mật khẩu không đúng.", 401);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _khachHangRepository.EmailExistsAsync(dto.Email))
            throw new AuthException("Email này đã được sử dụng.", 409);

        var maKhachHang = "KH" + DateTime.UtcNow.Ticks.ToString()[^8..];
        var newKhachHang = new KhachHang
        {
            MaKhachHang = maKhachHang,
            TenDangNhap = dto.Email,
            MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            HoTenKh = dto.FullName,
            Email = dto.Email,
            NgayDk = DateTime.UtcNow,
            TrangThai = 1
        };

        await _khachHangRepository.AddAsync(newKhachHang);
        return BuildAuthResponse(newKhachHang.MaKhachHang, newKhachHang.Email, newKhachHang.HoTenKh ?? "", "Customer");
    }

    public async Task<object> GetAllUsersAsync()
    {
        var users = new List<object>();

        // Gọi tuần tự để tránh xung đột DbContext (InvalidOperationException)
        var nhanViens = await _nhanVienRepository.GetAllAsync();
        if (nhanViens != null)
        {
            users.AddRange(nhanViens.Select(nv => new {
                Id = nv.MaNhanVien,
                FullName = nv.TenNv ?? "Chưa cập nhật",
                Email = nv.Email,
                Role = !string.IsNullOrWhiteSpace(nv.Role) ? nv.Role : (nv.VaiTroPhuTrach ?? "Staff")
            }));
        }

        var khachHangs = await _khachHangRepository.GetAllAsync();
        if (khachHangs != null)
        {
            users.AddRange(khachHangs.Select(kh => new {
                Id = kh.MaKhachHang,
                FullName = kh.HoTenKh ?? "Chưa cập nhật",
                Email = kh.Email,
                Role = "Customer"
            }));
        }

        return users;
    }

    public async Task DeleteUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) throw new AuthException("ID người dùng không hợp lệ.");

        if (userId.StartsWith("KH"))
        {
            var kh = await _khachHangRepository.GetByIdAsync(userId) ?? throw new AuthException("Không tìm thấy khách hàng.");
            await _khachHangRepository.DeleteAsync(kh);
        }
        else
        {
            var nv = await _nhanVienRepository.GetByIdAsync(userId) ?? throw new AuthException("Không tìm thấy nhân viên.");
            await _nhanVienRepository.DeleteAsync(nv);
        }
    }

    private AuthResponseDto BuildAuthResponse(string id, string email, string fullName, string role)
    {
        var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(id, email, fullName, role);
        return new AuthResponseDto { 
            Token = token, 
            ExpiresAt = expiresAt, 
            User = new UserInfoDto { Id = id, FullName = fullName, Email = email, Role = role } 
        };
    }

    private bool IsPasswordMatch(string inputPassword, string hashedPassword)
    {
        try { return BCrypt.Net.BCrypt.Verify(inputPassword, hashedPassword); }
        catch { return false; }
    }
}