using BookStore.API.Data;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Repositories.Implementations;

public class SachRepository : ISachRepository
{
    private readonly ApplicationDbContext _context;
    public SachRepository(ApplicationDbContext context) => _context = context;

    public async Task<(List<Sach> items, int total)> SearchAsync(string? keyword, string? maDanhMuc, int page, int pageSize)
    {
        var query = _context.Saches.Include(s => s.Gom).ThenInclude(g => g.DanhMuc).AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(s => s.TenSach.Contains(keyword) || (s.TacGia != null && s.TacGia.Contains(keyword)));

        if (!string.IsNullOrWhiteSpace(maDanhMuc))
            query = query.Where(s => s.Gom.Any(g => g.MaDanhMuc == maDanhMuc));

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(s => s.TenSach)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Sach?> GetByIdAsync(string id) =>
        await _context.Saches.Include(s => s.Gom).ThenInclude(g => g.DanhMuc).FirstOrDefaultAsync(s => s.MaSach == id);

    public async Task<List<DanhMuc>> GetDanhMucsAsync() => await _context.DanhMucs.ToListAsync();

    public async Task<bool> ExistsAsync(string id) => await _context.Saches.AnyAsync(s => s.MaSach == id);

    public async Task<Sach> AddAsync(Sach sach, string maDanhMuc)
    {
        _context.Saches.Add(sach);
        _context.Goms.Add(new Gom { MaSach = sach.MaSach, MaDanhMuc = maDanhMuc });
        await _context.SaveChangesAsync();
        return sach;
    }

    public async Task UpdateAsync(Sach sach, string maDanhMuc)
    {
        _context.Saches.Update(sach);

        var existingGom = await _context.Goms.Where(g => g.MaSach == sach.MaSach).ToListAsync();
        _context.Goms.RemoveRange(existingGom);
        _context.Goms.Add(new Gom { MaSach = sach.MaSach, MaDanhMuc = maDanhMuc });

        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var sach = await _context.Saches.FindAsync(id);
        if (sach is null) return false;

        var gomRows = _context.Goms.Where(g => g.MaSach == id);
        _context.Goms.RemoveRange(gomRows);
        _context.Saches.Remove(sach);
        await _context.SaveChangesAsync();
        return true;
    }
}
