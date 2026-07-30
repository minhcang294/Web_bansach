using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces;

public interface IKhachHangRepository
{
    Task<KhachHang?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<KhachHang> AddAsync(KhachHang khachHang);
    
    // Đã sửa lại đúng thành KhachHang
    Task<List<KhachHang>> GetAllAsync();
    Task<KhachHang?> GetByIdAsync(string id);
    Task DeleteAsync(KhachHang khachHang);
<<<<<<< HEAD
    
 
=======
>>>>>>> a41405f80f37a4b1af45c39748aea2f2078e7a41
    Task UpdateAsync(KhachHang khachHang);
}