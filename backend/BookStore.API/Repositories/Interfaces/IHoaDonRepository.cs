using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces;

public interface IHoaDonRepository
{
    Task<HoaDon> AddAsync(HoaDon hoaDon);
    Task<List<HoaDon>> GetByKhachHangIdAsync(string maKhachHang);
    Task<HoaDon?> GetByIdAsync(string id, string maKhachHang);
    // Bổ sung cho Admin
    Task<List<HoaDon>> GetAllAsync();
    Task<HoaDon?> GetByIdAsync(string maHoaDon); // Hàm lấy hóa đơn không cần mã khách hàng
    Task UpdateAsync(HoaDon hoaDon);
}
