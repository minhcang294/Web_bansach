using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces;

public interface IHoaDonRepository
{
    Task<HoaDon> AddAsync(HoaDon hoaDon);
    Task<List<HoaDon>> GetByKhachHangIdAsync(string maKhachHang);
    Task<HoaDon?> GetByIdAsync(string id, string maKhachHang);
}
