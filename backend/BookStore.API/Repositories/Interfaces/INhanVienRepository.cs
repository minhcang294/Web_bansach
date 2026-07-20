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
}