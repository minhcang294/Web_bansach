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
        return await _khachHangRepository.EmailExistsAsync(email) || 
               await _nhanVienRepository.GetByEmailAsync(email) != null;
    }

    // ========================================================================
    // 🌟 ĐÃ BỔ SUNG HÀM RESET MẬT KHẨU VÀO ĐÂY 🌟
    // ========================================================================
    public async Task<bool> ResetPasswordAsync(string email, string newPassword)
    {
        // Bước 1: Tìm trong bảng Khách Hàng (User bình thường) trước
        var khachHang = await _khachHangRepository.GetByEmailAsync(email);
        if (khachHang != null)
        {
            khachHang.MatKhau = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _khachHangRepository.UpdateAsync(khachHang);
            return true;
        }

        // Bước 2: Nếu KHÔNG TÌM THẤY ở bảng Khách Hàng, thì tìm tiếp trong bảng Nhân Viên (Staff / Admin)
        var nhanVien = await _nhanVienRepository.GetByEmailAsync(email);
        if (nhanVien != null)
        {
            nhanVien.MatKhau = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _nhanVienRepository.UpdateAsync(nhanVien);
            return true;
        }
        
        return false;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var nhanVien = await _nhanVienRepository.GetByEmailAsync(dto.Email);
        if (nhanVien != null && IsPasswordMatch(dto.Password, nhanVien.MatKhau))
        {
            if (nhanVien.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            
            string dbRole = nhanVien.Role?.Trim() ?? nhanVien.VaiTroPhuTrach?.Trim() ?? "Staff";
            string role = "Staff";
            if (dbRole.Equals("Admin", StringComparison.OrdinalIgnoreCase)) role = "Admin";
            else if (dbRole.Equals("Staff", StringComparison.OrdinalIgnoreCase)) role = "Staff";
            
            return BuildAuthResponse(nhanVien.MaNhanVien, nhanVien.Email, nhanVien.TenNv ?? "Admin", role);
        }

        var khachHang = await _khachHangRepository.GetByEmailAsync(dto.Email);
        if (khachHang != null && IsPasswordMatch(dto.Password, khachHang.MatKhau))
        {
            if (khachHang.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            return BuildAuthResponse(khachHang.MaKhachHang, khachHang.Email, khachHang.HoTenKh ?? "Khách hàng", "User");
        }

        throw new AuthException("Email hoặc mật khẩu không đúng.", 401);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await EmailExistsAsync(dto.Email))
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
        return BuildAuthResponse(newKhachHang.MaKhachHang, newKhachHang.Email, newKhachHang.HoTenKh ?? "", "User");
    }

    public async Task<AuthResponseDto> CreateUserByAdminAsync(RegisterDto dto)
    {
        string role = !string.IsNullOrWhiteSpace(dto.Role) ? dto.Role.Trim() : "User";

        if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase) || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
        {
            if (await EmailExistsAsync(dto.Email))
                throw new AuthException("Email này đã tồn tại trong hệ thống.", 409);

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
            if (khachHang.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            return BuildAuthResponse(khachHang.MaKhachHang, khachHang.Email, khachHang.HoTenKh ?? "Khách hàng", "User");
        }

        var nhanVien = await _nhanVienRepository.GetByEmailAsync(email);
        if (nhanVien != null)
        {
            if (nhanVien.TrangThai == 0) throw new AuthException("Tài khoản đã bị khóa.", 403);
            string role = nhanVien.Role ?? "Staff";
            return BuildAuthResponse(nhanVien.MaNhanVien, nhanVien.Email, nhanVien.TenNv ?? "Admin", role);
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
        return BuildAuthResponse(newKhachHang.MaKhachHang, newKhachHang.Email, newKhachHang.HoTenKh ?? "", "User");
    }

    public async Task<object> GetAllUsersAsync()
    {
        var users = new List<object>();

        var nhanViens = await _nhanVienRepository.GetAllAsync();
        if (nhanViens != null)
        {
            users.AddRange(nhanViens
                .Where(nv => nv.Email != null && !nv.Email.Contains("_migrated"))
                .Select(nv => new {
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
            users.AddRange(khachHangs
                .Where(kh => kh.Email != null && !kh.Email.Contains("_migrated"))
                .Select(kh => new {
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

        if (string.IsNullOrWhiteSpace(dto.Role))
            throw new AuthException("Lỗi lập trình: Giao diện (Frontend) đang gửi thiếu thuộc tính 'Role' (hoặc sai chữ hoa/thường).");

        string newRole = dto.Role.Trim();

        if (userId.StartsWith("KH"))
        {
            var kh = await _khachHangRepository.GetByIdAsync(userId) ?? throw new AuthException("Không tìm thấy khách hàng.");
            
            if (newRole == "Admin" || newRole == "Staff")
            {
                if (await _nhanVienRepository.GetByEmailAsync(dto.Email) != null)
                    throw new AuthException("Lỗi: Email này đã tồn tại trong danh sách Nhân viên, không thể thăng chức!");

                var maNhanVien = "NV" + DateTime.UtcNow.Ticks.ToString()[^8..];
                var newNhanVien = new NhanVien
                {
                    MaNhanVien = maNhanVien,
                    Email = dto.Email,
                    TenNv = dto.FullName,
                    MatKhau = kh.MatKhau, 
                    Role = newRole,
                    VaiTroPhuTrach = newRole,
                    TrangThai = dto.Status
                };
                await _nhanVienRepository.AddAsync(newNhanVien);
                
                try 
                {
                    await _khachHangRepository.DeleteAsync(kh); 
                }
                catch 
                {
                    kh.TrangThai = 0;
                    kh.Email = kh.Email + "_migrated_" + DateTime.Now.Ticks; 
                    await _khachHangRepository.UpdateAsync(kh);
                }
            }
            else
            {
                kh.HoTenKh = dto.FullName;
                kh.Email = dto.Email;
                kh.TrangThai = dto.Status;
                await _khachHangRepository.UpdateAsync(kh);
            }
        }
        else 
        {
            var nv = await _nhanVienRepository.GetByIdAsync(userId) ?? throw new AuthException("Không tìm thấy nhân viên.");
            
            if (newRole == "User")
            {
                if (await _khachHangRepository.GetByEmailAsync(dto.Email) != null)
                    throw new AuthException("Lỗi: Email này đã tồn tại bên danh sách Khách hàng, không thể giáng chức!");

                var maKhachHang = "KH" + DateTime.UtcNow.Ticks.ToString()[^8..];
                var newKhachHang = new KhachHang
                {
                    MaKhachHang = maKhachHang,
                    TenDangNhap = dto.Email,
                    Email = dto.Email,
                    HoTenKh = dto.FullName,
                    MatKhau = nv.MatKhau,
                    TrangThai = dto.Status,
                    NgayDk = DateTime.UtcNow
                };
                await _khachHangRepository.AddAsync(newKhachHang);
                
                try 
                {
                    await _nhanVienRepository.DeleteAsync(nv);
                }
                catch 
                {
                    nv.TrangThai = 0;
                    nv.Email = nv.Email + "_migrated_" + DateTime.Now.Ticks;
                    await _nhanVienRepository.UpdateAsync(nv);
                }
            }
            else
            {
                nv.TenNv = dto.FullName;
                nv.Email = dto.Email;
                nv.Role = newRole;
                nv.VaiTroPhuTrach = newRole;
                nv.TrangThai = dto.Status;
                await _nhanVienRepository.UpdateAsync(nv);
            }
        }
    }

    public async Task ToggleUserStatusAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) throw new AuthException("ID người dùng không hợp lệ.");

        if (userId.StartsWith("KH"))
        {
            var kh = await _khachHangRepository.GetByIdAsync(userId) ?? throw new AuthException("Không tìm thấy khách hàng.");
            kh.TrangThai = kh.TrangThai == 1 ? 0 : 1; 
            await _khachHangRepository.UpdateAsync(kh);
        }
        else
        {
            var nv = await _nhanVienRepository.GetByIdAsync(userId) ?? throw new AuthException("Không tìm thấy nhân viên.");
            nv.TrangThai = nv.TrangThai == 1 ? 0 : 1; 
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
}