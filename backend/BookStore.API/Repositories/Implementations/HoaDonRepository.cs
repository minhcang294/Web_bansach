using BookStore.API.Data;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Repositories.Implementations;

public class HoaDonRepository : IHoaDonRepository
{
    private readonly ApplicationDbContext _context;
    public HoaDonRepository(ApplicationDbContext context) => _context = context;

    public async Task<HoaDon> AddAsync(HoaDon hoaDon)
    {
        _context.HoaDons.Add(hoaDon);
        await _context.SaveChangesAsync();
        return hoaDon;
    }

    public async Task<List<HoaDon>> GetByKhachHangIdAsync(string maKhachHang) =>
        await _context.HoaDons
            .Include(h => h.ChiTietHoaDons).ThenInclude(c => c.Sach)
            .Where(h => h.MaKhachHang == maKhachHang)
            .OrderByDescending(h => h.NgayDatHang)
            .ToListAsync();

    public async Task<HoaDon?> GetByIdAsync(string id, string maKhachHang) =>
        await _context.HoaDons
            .Include(h => h.ChiTietHoaDons).ThenInclude(c => c.Sach)
            .FirstOrDefaultAsync(h => h.MaHoaDon == id && h.MaKhachHang == maKhachHang);

    // =========================================================
    // CÁC HÀM MỚI BỔ SUNG DÀNH CHO ADMIN
    // =========================================================

    public async Task<List<HoaDon>> GetAllAsync()
    {
        // Lấy tất cả hóa đơn kèm chi tiết sách, sắp xếp đơn mới nhất lên đầu
        return await _context.HoaDons
            .Include(h => h.ChiTietHoaDons).ThenInclude(c => c.Sach)
            .OrderByDescending(h => h.NgayDatHang)
            .ToListAsync();
    }

    public async Task<HoaDon?> GetByIdAsync(string maHoaDon)
    {
        // Lấy hóa đơn theo ID (không cần ID khách hàng), dùng cho việc cập nhật trạng thái
        return await _context.HoaDons
            .Include(h => h.ChiTietHoaDons).ThenInclude(c => c.Sach)
            .FirstOrDefaultAsync(h => h.MaHoaDon == maHoaDon);
    }

    public async Task UpdateAsync(HoaDon hoaDon)
    {
        _context.HoaDons.Update(hoaDon);
        await _context.SaveChangesAsync();
    }
}