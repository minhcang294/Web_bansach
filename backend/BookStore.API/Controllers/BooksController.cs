using BookStore.API.Models.DTOs.Book;
using BookStore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;
    public BooksController(IBookService bookService) => _bookService = bookService;

    /// <summary>Danh sách sách - tìm kiếm, lọc theo danh mục, phân trang. Công khai.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? keyword, [FromQuery] string? categoryId,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var result = await _bookService.SearchAsync(keyword, categoryId, page, pageSize);
        return Ok(result);
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
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Chỉ Admin được sửa sách.</summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, [FromBody] BookUpdateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var updated = await _bookService.UpdateAsync(id, dto);
        return updated is null ? NotFound(new { message = "Không tìm thấy sách." }) : Ok(updated);
    }

    /// <summary>Chỉ Admin được xóa sách.</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _bookService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound(new { message = "Không tìm thấy sách." });
    }
}
