using BookStore.API.Data;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Repositories.Implementations;

public class NhanVienRepository : INhanVienRepository
{
    private readonly ApplicationDbContext _context;

    public NhanVienRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<NhanVien?> GetByEmailAsync(string email)
    {
        return await _context.NhanViens.FirstOrDefaultAsync(n => n.Email == email);
    }

    // ==========================================
    // CÁC HÀM QUẢN LÝ NGƯỜI DÙNG (ADMIN)
    // ==========================================

    public async Task<List<NhanVien>> GetAllAsync()
    {
        // Trả về danh sách rỗng thay vì null nếu không tìm thấy để tránh lỗi phía Service
        return await _context.NhanViens.ToListAsync() ?? new List<NhanVien>();
    }

    public async Task<NhanVien?> GetByIdAsync(string id)
    {
        return await _context.NhanViens.FirstOrDefaultAsync(n => n.MaNhanVien == id);
    }

    public async Task DeleteAsync(NhanVien nhanVien)
    {
        // Kiểm tra an toàn: nếu đối tượng truyền vào là null thì không thực hiện lệnh xóa
        if (nhanVien == null) 
            throw new ArgumentNullException(nameof(nhanVien), "Nhân viên không được để trống.");

        _context.NhanViens.Remove(nhanVien);
        await _context.SaveChangesAsync();
    }
}