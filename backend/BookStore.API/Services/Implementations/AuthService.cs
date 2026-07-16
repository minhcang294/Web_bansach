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
        // 1. Thử tìm trong bảng NHANVIEN trước (Admin/Staff)
        var nhanVien = await _nhanVienRepository.GetByEmailAsync(dto.Email);
        if (nhanVien is not null && BCrypt.Net.BCrypt.Verify(dto.Password, nhanVien.MatKhau))
        {
            if (nhanVien.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            return BuildAuthResponse(nhanVien.MaNhanVien, nhanVien.Email, nhanVien.TenNv ?? "", nhanVien.VaiTroPhuTrach);
        }

        // 2. Nếu không phải nhân viên, thử tìm trong bảng KHACHHANG
        var khachHang = await _khachHangRepository.GetByEmailAsync(dto.Email);
        if (khachHang is not null && BCrypt.Net.BCrypt.Verify(dto.Password, khachHang.MatKhau))
        {
            if (khachHang.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            return BuildAuthResponse(khachHang.MaKhachHang, khachHang.Email, khachHang.HoTenKh ?? "", "Customer");
        }

        // Không tiết lộ email/mật khẩu sai cụ thể để tránh dò tài khoản
        throw new AuthException("Email hoặc mật khẩu không đúng.", 401);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Đăng ký công khai chỉ tạo tài khoản KHÁCH HÀNG.
        // Tài khoản NHANVIEN (Admin/Staff) do quản trị viên tạo trực tiếp trong DB, không qua API công khai.
        if (await _khachHangRepository.EmailExistsAsync(dto.Email))
            throw new AuthException("Email này đã được sử dụng.", 409);

        var maKhachHang = "KH" + DateTime.UtcNow.Ticks.ToString()[^8..]; // sinh mã tự động, ví dụ KH12345678

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

    private AuthResponseDto BuildAuthResponse(string id, string email, string fullName, string role)
    {
        var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(id, email, fullName, role);
        return new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = new UserInfoDto { Id = id, FullName = fullName, Email = email, Role = role }
        };
    }
}
