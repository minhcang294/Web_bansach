using BookStore.API.Data;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Repositories.Implementations;

public class GioHangRepository : IGioHangRepository
{
    private readonly ApplicationDbContext _context;
    public GioHangRepository(ApplicationDbContext context) => _context = context;

    public async Task<List<GioHang>> GetByKhachHangIdAsync(string maKhachHang) =>
        await _context.GioHangs.Include(g => g.Sach).Where(g => g.MaKhachHang == maKhachHang).ToListAsync();

    public async Task<GioHang?> GetItemAsync(string maKhachHang, string maSach) =>
        await _context.GioHangs.FirstOrDefaultAsync(g => g.MaKhachHang == maKhachHang && g.MaSach == maSach);

    public async Task<GioHang?> GetByIdAsync(int id, string maKhachHang) =>
        await _context.GioHangs.Include(g => g.Sach).FirstOrDefaultAsync(g => g.MaGioHang == id && g.MaKhachHang == maKhachHang);

    public async Task AddAsync(GioHang item)
    {
        _context.GioHangs.Add(item);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(GioHang item)
    {
        _context.GioHangs.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(GioHang item)
    {
        _context.GioHangs.Remove(item);
        await _context.SaveChangesAsync();
    }

    public async Task ClearAsync(string maKhachHang)
    {
        var items = _context.GioHangs.Where(g => g.MaKhachHang == maKhachHang);
        _context.GioHangs.RemoveRange(items);
        await _context.SaveChangesAsync();
    }
}
