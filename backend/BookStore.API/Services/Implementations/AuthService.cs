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

    public async Task<bool> EmailExistsAsync(string email)
{
    return await _khachHangRepository.EmailExistsAsync(email);
}

public async Task<bool> ResetPasswordAsync(string email, string newPassword)
{
    var khachHang = await _khachHangRepository.GetByEmailAsync(email);
    if (khachHang == null) return false;

    khachHang.MatKhau = BCrypt.Net.BCrypt.HashPassword(newPassword);
    await _khachHangRepository.UpdateAsync(khachHang);
    return true;
}
    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        // 1. Kiểm tra Nhân viên/Admin
        var nhanVien = await _nhanVienRepository.GetByEmailAsync(dto.Email);
        if (nhanVien != null && IsPasswordMatch(dto.Password, nhanVien.MatKhau))
        {
            if (nhanVien.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            
            // 👉 Chuẩn hóa Role an toàn, loại bỏ khoảng trắng và không phân biệt hoa thường
            string dbRole = nhanVien.Role?.Trim() ?? nhanVien.VaiTroPhuTrach?.Trim() ?? "Staff";
            string role = "Staff";
            if (dbRole.Equals("Admin", StringComparison.OrdinalIgnoreCase)) role = "Admin";
            else if (dbRole.Equals("Staff", StringComparison.OrdinalIgnoreCase)) role = "Staff";
            
            return BuildAuthResponse(nhanVien.MaNhanVien, nhanVien.Email, nhanVien.TenNv ?? "Admin", role);
        }

        // 2. Kiểm tra Khách hàng
        var khachHang = await _khachHangRepository.GetByEmailAsync(dto.Email);
        if (khachHang != null && IsPasswordMatch(dto.Password, khachHang.MatKhau))
        {
            if (khachHang.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            // ĐÃ SỬA: Đồng bộ từ "Customer" thành "User" để khớp với hệ thống phân quyền và giao diện React
            return BuildAuthResponse(khachHang.MaKhachHang, khachHang.Email, khachHang.HoTenKh ?? "Khách hàng", "User");
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
        // ĐÃ SỬA: Đồng bộ role thành "User"
        return BuildAuthResponse(newKhachHang.MaKhachHang, newKhachHang.Email, newKhachHang.HoTenKh ?? "", "User");
    }

    public async Task<AuthResponseDto> CreateUserByAdminAsync(RegisterDto dto)
    {
        string role = !string.IsNullOrWhiteSpace(dto.Role) ? dto.Role.Trim() : "User";

        if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase) || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
        {
            if (await _nhanVienRepository.GetByEmailAsync(dto.Email) != null)
                throw new AuthException("Email này đã được sử dụng cho một nhân viên khác.", 409);

            var maNhanVien = "NV" + DateTime.UtcNow.Ticks.ToString()[^8..];
            var newNhanVien = new NhanVien
            {
                MaNhanVien = maNhanVien,
                Email = dto.Email,
                TenNv = dto.FullName,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = role,
                VaiTroPhuTrach = role,
                TrangThai = 1
            };

            await _nhanVienRepository.AddAsync(newNhanVien);
            return BuildAuthResponse(newNhanVien.MaNhanVien, newNhanVien.Email, newNhanVien.TenNv ?? "", role);
        }
        else
        {
            return await RegisterAsync(dto);
        }
    }

    public async Task<AuthResponseDto> GoogleLoginAsync(string email, string name)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new AuthException("Email từ Google không hợp lệ.", 400);

        var khachHang = await _khachHangRepository.GetByEmailAsync(email);

        if (khachHang != null)
        {
            if (khachHang.TrangThai == 0) 
                throw new AuthException("Tài khoản đã bị khóa.", 403);

            // ĐÃ SỬA: Đồng bộ role thành "User"
            return BuildAuthResponse(khachHang.MaKhachHang, khachHang.Email, khachHang.HoTenKh ?? "Khách hàng", "User");
        }

        var maKhachHang = "KH" + DateTime.UtcNow.Ticks.ToString()[^8..];
        var newKhachHang = new KhachHang
        {
            MaKhachHang = maKhachHang,
            TenDangNhap = email,
            MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
            HoTenKh = !string.IsNullOrWhiteSpace(name) ? name : email.Split('@')[0],
            Email = email,
            NgayDk = DateTime.UtcNow,
            TrangThai = 1
        };

        await _khachHangRepository.AddAsync(newKhachHang);

        // ĐÃ SỬA: Đồng bộ role thành "User"
        return BuildAuthResponse(newKhachHang.MaKhachHang, newKhachHang.Email, newKhachHang.HoTenKh ?? "", "User");
    }

    public async Task<object> GetAllUsersAsync()
    {
        var users = new List<object>();

        var nhanViens = await _nhanVienRepository.GetAllAsync();
        if (nhanViens != null)
        {
            users.AddRange(nhanViens.Select(nv => new {
                Id = nv.MaNhanVien,
                FullName = nv.TenNv ?? "Chưa cập nhật",
                Email = nv.Email,
                Role = !string.IsNullOrWhiteSpace(nv.Role) ? nv.Role : (nv.VaiTroPhuTrach ?? "Staff"),
                Status = nv.TrangThai
            }));
        }

        var khachHangs = await _khachHangRepository.GetAllAsync();
        if (khachHangs != null)
        {
            users.AddRange(khachHangs.Select(kh => new {
                Id = kh.MaKhachHang,
                FullName = kh.HoTenKh ?? "Chưa cập nhật",
                Email = kh.Email,
                Role = "User",
                Status = kh.TrangThai
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

    public async Task UpdateUserAsync(string userId, UpdateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(userId)) 
            throw new AuthException("ID người dùng không hợp lệ.");

        if (userId.StartsWith("KH"))
        {
            var kh = await _khachHangRepository.GetByIdAsync(userId) 
                   ?? throw new AuthException("Không tìm thấy khách hàng.");
            
            kh.HoTenKh = dto.FullName;
            kh.Email = dto.Email;
            kh.TrangThai = dto.Status;
            
            await _khachHangRepository.UpdateAsync(kh);
        }
        else
        {
            var nv = await _nhanVienRepository.GetByIdAsync(userId) 
                   ?? throw new AuthException("Không tìm thấy nhân viên.");
            
            nv.TenNv = dto.FullName;
            nv.Email = dto.Email;
            nv.Role = dto.Role;
            nv.VaiTroPhuTrach = dto.Role;
            nv.TrangThai = dto.Status;
            
            await _nhanVienRepository.UpdateAsync(nv);
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

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _khachHangRepository.EmailExistsAsync(email);
    }

    public async Task<bool> ResetPasswordAsync(string email, string newPassword)
    {
        var khachHang = await _khachHangRepository.GetByEmailAsync(email);
        if (khachHang == null) return false;

        khachHang.MatKhau = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _khachHangRepository.UpdateAsync(khachHang);
        return true;
    }
}