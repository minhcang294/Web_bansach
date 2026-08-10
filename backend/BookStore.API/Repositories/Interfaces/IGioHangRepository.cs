using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces;

public interface IGioHangRepository
{
    Task<List<GioHang>> GetByKhachHangIdAsync(string maKhachHang);
    Task<GioHang?> GetItemAsync(string maKhachHang, string maSach);
    Task<GioHang?> GetByIdAsync(int id, string maKhachHang);
    Task AddAsync(GioHang item);
    Task UpdateAsync(GioHang item);
    Task RemoveAsync(GioHang item);
    Task ClearAsync(string maKhachHang);
}
