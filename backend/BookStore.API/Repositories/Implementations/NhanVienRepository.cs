using BookStore.API.Data;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Repositories.Implementations;

public class NhanVienRepository : INhanVienRepository
{
    private readonly ApplicationDbContext _context;
    public NhanVienRepository(ApplicationDbContext context) => _context = context;

    public async Task<NhanVien?> GetByEmailAsync(string email) =>
        await _context.NhanViens.FirstOrDefaultAsync(n => n.Email.ToLower() == email.ToLower());
}
