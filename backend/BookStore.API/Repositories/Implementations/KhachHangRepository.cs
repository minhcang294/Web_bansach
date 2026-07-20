using BookStore.API.Data;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Repositories.Implementations;

public class KhachHangRepository : IKhachHangRepository
{
    private readonly ApplicationDbContext _context;

    public KhachHangRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<KhachHang?> GetByEmailAsync(string email)
    {
        return await _context.KhachHangs.FirstOrDefaultAsync(k => k.Email == email);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.KhachHangs.AnyAsync(k => k.Email == email);
    }

    public async Task<KhachHang> AddAsync(KhachHang khachHang)
    {
        _context.KhachHangs.Add(khachHang);
        await _context.SaveChangesAsync();
        return khachHang;
    }

    // ==========================================
    // CÁC HÀM QUẢN LÝ NGƯỜI DÙNG (ADMIN)
    // ==========================================

    public async Task<List<KhachHang>> GetAllAsync()
    {
        // Sử dụng ToListAsync() là đúng, thêm ?? mới để đảm bảo không trả về null
        return await _context.KhachHangs.ToListAsync() ?? new List<KhachHang>();
    }

    public async Task<KhachHang?> GetByIdAsync(string id)
    {
        return await _context.KhachHangs.FirstOrDefaultAsync(k => k.MaKhachHang == id);
    }

    public async Task DeleteAsync(KhachHang khachHang)
    {
        // Kiểm tra null để tránh lỗi hệ thống nếu gọi nhầm
        if (khachHang == null) 
            throw new ArgumentNullException(nameof(khachHang), "Khách hàng không được để trống.");

        _context.KhachHangs.Remove(khachHang);
        await _context.SaveChangesAsync();
    }
}