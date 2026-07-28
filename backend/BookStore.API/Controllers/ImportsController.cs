using BookStore.API.Data;
using BookStore.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Controllers;

[Route("api/imports")]
[ApiController]
public class ImportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ImportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetImports()
    {
        try
        {
            var rawImports = await _context.PhieuNhaps
                .Include(p => p.NhaCungCap)
                .Include(p => p.NhanVien)
                .Include(p => p.ChiTietPhieuNhaps)
                    .ThenInclude(ct => ct.Sach)
                .OrderByDescending(p => p.NgayNhap)
                .ToListAsync();

            var imports = rawImports.Select(p => new {
                maPhieuNhap = p.MaPhieuNhap,
                maNhaCungCap = p.MaNhaCungCap,
                tenNhaCungCap = p.NhaCungCap != null ? p.NhaCungCap.TenNhaCungCap : p.MaNhaCungCap,
                maNhanVien = p.MaNhanVien,
                tenNhanVien = p.NhanVien != null ? p.NhanVien.TenNv : p.MaNhanVien,
                ngayNhap = p.NgayNhap,
                tongTien = p.TongTien,
                chiTietPhieuNhaps = p.ChiTietPhieuNhaps != null ? p.ChiTietPhieuNhaps.Select(ct => new {
                    maSach = ct.MaSach,
                    tenSach = ct.Sach != null ? ct.Sach.TenSach : ct.MaSach,
                    soLuongNhap = ct.SoLuongNhap,
                    giaNhap = ct.GiaNhap,
                    thanhTien = ct.ThanhTien
                }).ToList() : new()
            }).ToList();

            return Ok(imports);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetImportById(string id)
    {
        try
        {
            var rawImport = await _context.PhieuNhaps
                .Include(p => p.NhaCungCap)
                .Include(p => p.NhanVien)
                .Include(p => p.ChiTietPhieuNhaps)
                    .ThenInclude(ct => ct.Sach)
                .FirstOrDefaultAsync(p => p.MaPhieuNhap == id);

            if (rawImport == null)
            {
                return NotFound(new { message = "Không tìm thấy phiếu nhập!" });
            }

            var import = new {
                maPhieuNhap = rawImport.MaPhieuNhap,
                maNhaCungCap = rawImport.MaNhaCungCap,
                tenNhaCungCap = rawImport.NhaCungCap != null ? rawImport.NhaCungCap.TenNhaCungCap : rawImport.MaNhaCungCap,
                maNhanVien = rawImport.MaNhanVien,
                tenNhanVien = rawImport.NhanVien != null ? rawImport.NhanVien.TenNv : rawImport.MaNhanVien,
                ngayNhap = rawImport.NgayNhap,
                tongTien = rawImport.TongTien,
                chiTietPhieuNhaps = rawImport.ChiTietPhieuNhaps != null ? rawImport.ChiTietPhieuNhaps.Select(ct => new {
                    maSach = ct.MaSach,
                    tenSach = ct.Sach != null ? ct.Sach.TenSach : ct.MaSach,
                    soLuongNhap = ct.SoLuongNhap,
                    giaNhap = ct.GiaNhap,
                    thanhTien = ct.ThanhTien
                }).ToList() : new()
            };

            return Ok(import);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
        }
    }

    private async Task<string> GetOrSaveSupplierAsync(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return "NCC01";
        var supplier = await _context.NhaCungCaps
            .FirstOrDefaultAsync(s => s.MaNhaCungCap == input || s.TenNhaCungCap == input);

        if (supplier != null) return supplier.MaNhaCungCap;

        string newId = "NCC" + new Random().Next(100, 999);
        while (await _context.NhaCungCaps.AnyAsync(s => s.MaNhaCungCap == newId))
        {
            newId = "NCC" + new Random().Next(100, 999);
        }

        var newSup = new NhaCungCap
        {
            MaNhaCungCap = newId,
            TenNhaCungCap = input,
            MoTa = "Được thêm tự động khi nhập kho"
        };
        _context.NhaCungCaps.Add(newSup);
        await _context.SaveChangesAsync();
        return newId;
    }

    // Xử lý thông minh: Nhận diện mã hoặc tên sách, nếu là sách mới sẽ tự động tạo mã ngắn an toàn
    private async Task<string> GetOrSaveBookAsync(string inputBook, decimal giaNhap)
    {
        if (string.IsNullOrWhiteSpace(inputBook)) return "S001";

        // 1. Kiểm tra theo Mã sách
        var bookByCode = await _context.Saches.FirstOrDefaultAsync(s => s.MaSach == inputBook);
        if (bookByCode != null) return bookByCode.MaSach;

        // 2. Kiểm tra theo Tên sách
        var bookByName = await _context.Saches.FirstOrDefaultAsync(s => s.TenSach == inputBook);
        if (bookByName != null) return bookByName.MaSach;

        // 3. Nếu chưa có, tạo mã ngắn an toàn (vd: BK123) và lưu tên sách vào TenSach
        string newMaSach = "BK" + new Random().Next(1000, 9999);
        while (await _context.Saches.AnyAsync(s => s.MaSach == newMaSach))
        {
            newMaSach = "BK" + new Random().Next(1000, 9999);
        }

        var newSach = new Sach
        {
            MaSach = newMaSach,
            TenSach = inputBook,
            GiaBan = giaNhap > 0 ? giaNhap * 1.2m : 50000,
            SoLuongTon = 0
        };

        _context.Saches.Add(newSach);
        await _context.SaveChangesAsync();

        return newMaSach;
    }

    [HttpPost]
    public async Task<IActionResult> CreateImport([FromBody] CreateImportDto dto)
    {
        if (dto == null || string.IsNullOrEmpty(dto.MaPhieuNhap) || dto.ChiTietPhieuNhaps == null || !dto.ChiTietPhieuNhaps.Any())
        {
            return BadRequest(new { message = "Dữ liệu phiếu nhập không hợp lệ hoặc thiếu chi tiết sách!" });
        }

        var existing = await _context.PhieuNhaps.FindAsync(dto.MaPhieuNhap);
        if (existing != null)
        {
            return BadRequest(new { message = "Mã phiếu nhập này đã tồn tại trong hệ thống!" });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            string validMaNCC = await GetOrSaveSupplierAsync(dto.MaNhaCungCap);
            decimal tongTienPhieu = 0;

            var phieuNhap = new PhieuNhap
            {
                MaPhieuNhap = dto.MaPhieuNhap,
                MaNhaCungCap = validMaNCC,
                MaNhanVien = string.IsNullOrEmpty(dto.MaNhanVien) ? "NV001" : dto.MaNhanVien,
                NgayNhap = DateTime.Now,
                TongTien = 0
            };

            _context.PhieuNhaps.Add(phieuNhap);
            await _context.SaveChangesAsync();

            foreach (var item in dto.ChiTietPhieuNhaps)
            {
                string validMaSach = await GetOrSaveBookAsync(item.MaSach, item.GiaNhap);

                var thanhTien = item.SoLuongNhap * item.GiaNhap;
                tongTienPhieu += thanhTien;

                var chiTiet = new ChiTietPhieuNhap
                {
                    MaPhieuNhap = dto.MaPhieuNhap,
                    MaSach = validMaSach,
                    SoLuongNhap = item.SoLuongNhap,
                    GiaNhap = item.GiaNhap,
                    ThanhTien = thanhTien
                };
                _context.ChiTietPhieuNhaps.Add(chiTiet);

                var sach = await _context.Saches.FindAsync(validMaSach);
                if (sach != null)
                {
                    sach.SoLuongTon += item.SoLuongNhap;
                }
            }

            phieuNhap.TongTien = tongTienPhieu;
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Tạo phiếu nhập thành công và đã cập nhật tồn kho!", maPhieuNhap = dto.MaPhieuNhap });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Lỗi khi lưu phiếu nhập: " + (ex.InnerException?.Message ?? ex.Message) });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateImport(string id, [FromBody] CreateImportDto dto)
    {
        if (dto == null || dto.ChiTietPhieuNhaps == null || !dto.ChiTietPhieuNhaps.Any())
        {
            return BadRequest(new { message = "Dữ liệu phiếu nhập không hợp lệ!" });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var phieuNhap = await _context.PhieuNhaps
                .Include(p => p.ChiTietPhieuNhaps)
                .FirstOrDefaultAsync(p => p.MaPhieuNhap == id);

            if (phieuNhap == null)
            {
                return NotFound(new { message = "Không tìm thấy phiếu nhập!" });
            }

            foreach (var oldCt in phieuNhap.ChiTietPhieuNhaps)
            {
                var sach = await _context.Saches.FindAsync(oldCt.MaSach);
                if (sach != null)
                {
                    sach.SoLuongTon = Math.Max(0, sach.SoLuongTon - oldCt.SoLuongNhap);
                }
            }

            _context.ChiTietPhieuNhaps.RemoveRange(phieuNhap.ChiTietPhieuNhaps);

            string validMaNCC = await GetOrSaveSupplierAsync(dto.MaNhaCungCap);
            phieuNhap.MaNhaCungCap = validMaNCC;
            decimal tongTienMoi = 0;

            foreach (var item in dto.ChiTietPhieuNhaps)
            {
                string validMaSach = await GetOrSaveBookAsync(item.MaSach, item.GiaNhap);

                var thanhTien = item.SoLuongNhap * item.GiaNhap;
                tongTienMoi += thanhTien;

                var chiTietMoi = new ChiTietPhieuNhap
                {
                    MaPhieuNhap = id,
                    MaSach = validMaSach,
                    SoLuongNhap = item.SoLuongNhap,
                    GiaNhap = item.GiaNhap,
                    ThanhTien = thanhTien
                };
                _context.ChiTietPhieuNhaps.Add(chiTietMoi);

                var sach = await _context.Saches.FindAsync(validMaSach);
                if (sach != null)
                {
                    sach.SoLuongTon += item.SoLuongNhap;
                }
            }

            phieuNhap.TongTien = tongTienMoi;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Cập nhật phiếu nhập thành công!" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Lỗi khi cập nhật phiếu nhập: " + (ex.InnerException?.Message ?? ex.Message) });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteImport(string id)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var phieuNhap = await _context.PhieuNhaps
                .Include(p => p.ChiTietPhieuNhaps)
                .FirstOrDefaultAsync(p => p.MaPhieuNhap == id);

            if (phieuNhap == null)
            {
                return NotFound(new { message = "Không tìm thấy phiếu nhập!" });
            }

            foreach (var ct in phieuNhap.ChiTietPhieuNhaps)
            {
                var sach = await _context.Saches.FindAsync(ct.MaSach);
                if (sach != null)
                {
                    sach.SoLuongTon = Math.Max(0, sach.SoLuongTon - ct.SoLuongNhap);
                }
            }

            _context.PhieuNhaps.Remove(phieuNhap);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Đã xóa phiếu nhập thành công!" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Lỗi khi xóa phiếu nhập: " + (ex.InnerException?.Message ?? ex.Message) });
        }
    }
}

public class CreateImportDto
{
    public string MaPhieuNhap { get; set; } = string.Empty;
    public string MaNhaCungCap { get; set; } = string.Empty;
    public string MaNhanVien { get; set; } = string.Empty;
    public List<CreateImportDetailDto> ChiTietPhieuNhaps { get; set; } = new();
}

public class CreateImportDetailDto
{
    public string MaSach { get; set; } = string.Empty;
    public int SoLuongNhap { get; set; }
    public decimal GiaNhap { get; set; }
}