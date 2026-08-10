using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces;

public interface IKhachHangRepository
{
    Task<KhachHang?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<KhachHang> AddAsync(KhachHang khachHang);
}
