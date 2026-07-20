using BookStore.API.Models.Entities;

namespace BookStore.API.Data.Seed;

public static class DbSeeder
{
    // Tạo sẵn 1 tài khoản khách hàng + 1 tài khoản admin để đăng nhập thử ngay
    public static void SeedTestAccounts(ApplicationDbContext context)
    {
        context.Database.EnsureCreated();

        // 1. Tài khoản Khách hàng
        if (!context.KhachHangs.Any(k => k.Email == "test@bookstore.com"))
        {
            context.KhachHangs.Add(new KhachHang
            {
                MaKhachHang = "KH000001",
                TenDangNhap = "test@bookstore.com",
                MatKhau = BCrypt.Net.BCrypt.HashPassword("123456"), // Mật khẩu KH: 123456
                HoTenKh = "Người Dùng Test",
                Email = "test@bookstore.com",
                SoDienThoai = "0900000000",
                NgayDk = DateTime.UtcNow,
                TrangThai = 1
            });
        }

        // 2. Tài khoản Quản trị viên (Admin)
        if (!context.NhanViens.Any(n => n.Email == "admin@bookstore.com"))
        {
            context.NhanViens.Add(new NhanVien
            {
                MaNhanVien = "NV000001",
                TenDangNhap = "admin@bookstore.com",
                MatKhau = BCrypt.Net.BCrypt.HashPassword("admin123"), // Mật khẩu Admin: admin123
                TenNv = "Quản Trị Viên",
                Email = "admin@bookstore.com",
                VaiTroPhuTrach = "Admin",
                Role = "Admin", // BẮT BUỘC PHẢI CÓ DÒNG NÀY ĐỂ VÀO ĐƯỢC ADMIN
                TrangThaiLamViec = "DangLamViec",
                TrangThai = 1
            });
        }

        context.SaveChanges();
    }
}