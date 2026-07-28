using BookStore.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Controllers;

[Route("api/suppliers")]
[ApiController]
public class SuppliersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SuppliersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // CHỈ LẤY NHỮNG NHÀ CUNG CẤP ĐÃ CÓ PHIẾU NHẬP KHO
    [HttpGet]
    public async Task<IActionResult> GetSuppliers()
    {
        try
        {
            var suppliers = await _context.NhaCungCaps
                .Where(s => _context.PhieuNhaps.Any(p => p.MaNhaCungCap == s.MaNhaCungCap))
                .Select(s => new {
                    maNhaCungCap = s.MaNhaCungCap,
                    tenNhaCungCap = s.TenNhaCungCap
                })
                .ToListAsync();

            return Ok(suppliers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
        }
    }
}