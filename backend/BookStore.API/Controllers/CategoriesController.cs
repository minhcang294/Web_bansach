using BookStore.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class CategoriesController : ControllerBase
{
    private readonly IBookService _bookService;
    public CategoriesController(IBookService bookService) => _bookService = bookService;

    /// <summary>Lấy toàn bộ danh mục sách.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _bookService.GetCategoriesAsync());
}
