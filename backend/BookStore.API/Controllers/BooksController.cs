using BookStore.API.Models.DTOs.Book;
using BookStore.API.Models.Entities; 
using BookStore.API.Services.Interfaces;
using BookStore.API.Repositories.Interfaces; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; 

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;
    private readonly IActivityLogRepository _activityLogRepo; 

    public BooksController(IBookService bookService, IActivityLogRepository activityLogRepo) 
    {
        _bookService = bookService;
        _activityLogRepo = activityLogRepo;
    }

    /// <summary>Danh sách sách - tìm kiếm, lọc theo danh mục, phân trang. Công khai.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? keyword, [FromQuery] string? categoryId,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var result = await _bookService.SearchAsync(keyword, categoryId, page, pageSize);
        return Ok(result);
    }

    /// <summary>Tìm kiếm sách theo từ khóa. Công khai.</summary>
    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchBooks([FromQuery] string? keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return Ok(new List<object>()); 
        }

        var result = await _bookService.SearchAsync(keyword, null, 1, 50);
        return Ok(result.Items);
    }

    /// <summary>Chi tiết 1 cuốn sách theo mã sách. Công khai.</summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(string id)
    {
        var book = await _bookService.GetByIdAsync(id);
        return book is null ? NotFound(new { message = "Không tìm thấy sách." }) : Ok(book);
    }

    /// <summary>Thêm sách mới.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin, Staff, User")] 
    public async Task<IActionResult> Create([FromBody] BookCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        var created = await _bookService.CreateAsync(dto);

        // 👉 Ghi log lịch sử thêm mới
        var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Quản Trị Viên";
        await _activityLogRepo.AddLogAsync(new ActivityLog
        {
            Action = "Thêm mới",
            Details = $"Đã thêm sách mới (Mã: {created.Id})",
            EntityType = "Sách",
            Timestamp = DateTime.Now,
            UserId = userName
        });

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Sửa thông tin sách.</summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin, Staff, User")] 
    public async Task<IActionResult> Update(string id, [FromBody] BookUpdateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        var updated = await _bookService.UpdateAsync(id, dto);
        if (updated is null) return NotFound(new { message = "Không tìm thấy sách." });

        // 👉 Ghi log lịch sử cập nhật
        var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Quản Trị Viên";
        await _activityLogRepo.AddLogAsync(new ActivityLog
        {
            Action = "Cập nhật",
            Details = $"Cập nhật thông tin sách có mã: {id}",
            EntityType = "Sách",
            Timestamp = DateTime.Now,
            UserId = userName
        });

        return Ok(updated);
    }

    /// <summary>Xóa sách (Chỉ Admin).</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")] 
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            var deleted = await _bookService.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Không tìm thấy sách." });

            // 👉 Ghi log lịch sử xóa thành công
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Quản Trị Viên";
            await _activityLogRepo.AddLogAsync(new ActivityLog
            {
                Action = "Xóa",
                Details = $"Đã xóa sách có mã: {id}",
                EntityType = "Sách",
                Timestamp = DateTime.Now,
                UserId = userName
            });

            return NoContent();
        }
        catch (Exception)
        {
            // Bắt lỗi khi SQL Server từ chối xóa do vướng khóa ngoại (Hóa đơn / Phiếu nhập)
            return BadRequest(new { message = "Không thể xóa sách này vì đã có dữ liệu giao dịch liên quan (Hóa đơn hoặc Phiếu nhập)." });
        }
    }
}