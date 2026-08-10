using BookStore.API.Models.DTOs.Book;

namespace BookStore.API.Services.Interfaces;

public interface IBookService
{
    Task<PagedResult<BookDto>> SearchAsync(string? keyword, string? categoryId, int page, int pageSize);
    Task<BookDto?> GetByIdAsync(string id);
    Task<List<object>> GetCategoriesAsync();
    Task<BookDto> CreateAsync(BookCreateDto dto);
    Task<BookDto?> UpdateAsync(string id, BookUpdateDto dto);
    Task<bool> DeleteAsync(string id);
}
