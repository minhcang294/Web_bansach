using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookStore.API.Data; // Đã sửa lại đúng thư mục Data chứa ApplicationDbContext của bạn
using BookStore.API.Models.Entities; // Import thư mục chứa class DanhMuc
using BookStore.API.Models.DTOs; // Nơi chứa CategoryDto (nếu có)

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context; 

    public CategoriesController(ApplicationDbContext context) 
    {
        _context = context;
    }

    /// <summary>Lấy toàn bộ danh mục</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() 
    {
        // Chữ DanhMucs viết hoa chữ M (khớp với entity DanhMuc của bạn)
        var categories = await _context.DanhMucs.ToListAsync();
        return Ok(categories);
    }

    /// <summary>Thêm danh mục mới vào SQL Server</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CategoryDto dto)
    {
        try
        {
            var existing = await _context.DanhMucs.FindAsync(dto.Id);
            if (existing != null)
            {
                return BadRequest(new { message = "Mã danh mục này đã tồn tại!" });
            }

            var newCategory = new DanhMuc
            {
                MaDanhMuc = dto.Id,
                TenDanhMuc = dto.Name,
                Slug = dto.Slug,
                MoTa = dto.Description,
                ParentId = dto.ParentId
            };

            _context.DanhMucs.Add(newCategory);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm danh mục thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Cập nhật danh mục</summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] CategoryDto dto)
    {
        try
        {
            var category = await _context.DanhMucs.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy danh mục cần sửa!" });
            }

            category.TenDanhMuc = dto.Name;
            category.Slug = dto.Slug;
            category.MoTa = dto.Description;
            category.ParentId = dto.ParentId;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Xóa danh mục</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            var category = await _context.DanhMucs.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy danh mục!" });
            }

            _context.DanhMucs.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

// Bổ sung Model DTO nhận dữ liệu trực tiếp trong file này (để tránh lỗi thiếu DTO)
public class CategoryDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? ParentId { get; set; }
}