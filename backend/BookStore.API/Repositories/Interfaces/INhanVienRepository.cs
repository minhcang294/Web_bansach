using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces;

public interface INhanVienRepository
{
    // Hàm phục vụ cho xác thực (Login)
    Task<NhanVien?> GetByEmailAsync(string email);

    // Các hàm phục vụ Admin quản lý người dùng
    Task<List<NhanVien>> GetAllAsync();
    Task<NhanVien?> GetByIdAsync(string id);
    Task DeleteAsync(NhanVien nhanVien);
    
    // BỔ SUNG HÀM CẬP NHẬT (Để sửa lỗi gạch đỏ ở AuthService)
    Task UpdateAsync(NhanVien nhanVien);
    Task<NhanVien> AddAsync(NhanVien nhanVien);
}