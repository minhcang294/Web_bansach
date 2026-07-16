using BookStore.API.Data;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Repositories.Implementations;

public class KhachHangRepository : IKhachHangRepository
{
    private readonly ApplicationDbContext _context;
    public KhachHangRepository(ApplicationDbContext context) => _context = context;

    public async Task<KhachHang?> GetByEmailAsync(string email) =>
        await _context.KhachHangs.FirstOrDefaultAsync(k => k.Email.ToLower() == email.ToLower());

    public async Task<bool> EmailExistsAsync(string email) =>
        await _context.KhachHangs.AnyAsync(k => k.Email.ToLower() == email.ToLower());

    public async Task<KhachHang> AddAsync(KhachHang khachHang)
    {
        _context.KhachHangs.Add(khachHang);
        await _context.SaveChangesAsync();
        return khachHang;
    }
}
