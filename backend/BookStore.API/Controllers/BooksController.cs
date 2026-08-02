using BookStore.API.Models.DTOs.Book;
using BookStore.API.Services.Interfaces;
using BookStore.API.Repositories.Interfaces; // Tiêm thêm interface của Log
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;
    private readonly IActivityLogRepository _activityLogRepo; // Khai báo bộ ghi log

    // Đưa bộ ghi log vào Constructor để sử dụng
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

    // ====================================================================
    // API TÌM KIẾM RIÊNG ĐỂ KHỚP VỚI FRONTEND (/api/books/search)
    // ====================================================================
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

    /// <summary>Chi tiết 1 cuốn sách theo mã sách (MASACH). Công khai.</summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(string id)
    {
        var book = await _bookService.GetByIdAsync(id);
        return book is null ? NotFound(new { message = "Không tìm thấy sách." }) : Ok(book);
    }

    /// <summary>Chỉ Admin được thêm sách mới.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] BookCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        var created = await _bookService.CreateAsync(dto);

        // ---> BẮT ĐẦU GHI LOG: THÊM SÁCH <---
        // Lấy tên Admin đang đăng nhập từ Token, nếu không có thì để mặc định là "Admin"
        var userName = User.Identity?.Name ?? "Admin"; 
        await _activityLogRepo.LogActionAsync(
            userId: userName,
            action: "Thêm mới",
            entityType: "Sách",
           details: $"Đã thêm sách mới: {dto.Title} (Mã sách: {created.Id})"
        );

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Chỉ Admin được sửa sách.</summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, [FromBody] BookUpdateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        var updated = await _bookService.UpdateAsync(id, dto);
        if (updated is null) return NotFound(new { message = "Không tìm thấy sách." });

        // ---> BẮT ĐẦU GHI LOG: SỬA SÁCH <---
        var userName = User.Identity?.Name ?? "Admin";
        await _activityLogRepo.LogActionAsync(
            userId: userName,
            action: "Cập nhật",
            entityType: "Sách",
            details: $"Đã cập nhật thông tin cuốn sách có mã: {id}"
        );

        return Ok(updated);
    }

    /// <summary>Chỉ Admin được xóa sách.</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _bookService.DeleteAsync(id);
        if (!deleted) return NotFound(new { message = "Không tìm thấy sách." });

        // ---> BẮT ĐẦU GHI LOG: XÓA SÁCH <---
        var userName = User.Identity?.Name ?? "Admin";
        await _activityLogRepo.LogActionAsync(
            userId: userName,
            action: "Xóa",
            entityType: "Sách",
            details: $"Đã xóa cuốn sách có mã: {id}"
        );

        return NoContent();
    }
}