using BookStore.API.Models.DTOs.Book;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using BookStore.API.Services.Interfaces;

namespace BookStore.API.Services.Implementations;

public class BookService : IBookService
{
    private readonly ISachRepository _sachRepository;
    public BookService(ISachRepository sachRepository) => _sachRepository = sachRepository;

    public async Task<PagedResult<BookDto>> SearchAsync(string? keyword, string? categoryId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 12 : pageSize;

        var (items, total) = await _sachRepository.SearchAsync(keyword, categoryId, page, pageSize);

        return new PagedResult<BookDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalItems = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<BookDto?> GetByIdAsync(string id)
    {
        var sach = await _sachRepository.GetByIdAsync(id);
        return sach is null ? null : MapToDto(sach);
    }

    public async Task<List<object>> GetCategoriesAsync()
    {
        var list = await _sachRepository.GetDanhMucsAsync();
        return list.Select(d => (object)new { id = d.MaDanhMuc, name = d.TenDanhMuc }).ToList();
    }

    public async Task<BookDto> CreateAsync(BookCreateDto dto)
    {
        var maSach = "S" + DateTime.UtcNow.Ticks.ToString()[^9..]; // sinh mã tự động, ví dụ S123456789

        var sach = new Sach
        {
            MaSach = maSach,
            TenSach = dto.Title,
            TacGia = dto.Author,
            NoiDungDemo = dto.Description,
            GiaBan = dto.Price,
            SoLuongTon = dto.StockQuantity,
            AnhSach = dto.ImageUrl
        };

        await _sachRepository.AddAsync(sach, dto.CategoryId);
        var full = await _sachRepository.GetByIdAsync(sach.MaSach);
        return MapToDto(full!);
    }

    public async Task<BookDto?> UpdateAsync(string id, BookUpdateDto dto)
    {
        var sach = await _sachRepository.GetByIdAsync(id);
        if (sach is null) return null;

        sach.TenSach = dto.Title;
        sach.TacGia = dto.Author;
        sach.NoiDungDemo = dto.Description;
        sach.GiaBan = dto.Price;
        sach.SoLuongTon = dto.StockQuantity;
        sach.AnhSach = dto.ImageUrl;

        await _sachRepository.UpdateAsync(sach, dto.CategoryId);
        return MapToDto(sach);
    }

    public Task<bool> DeleteAsync(string id) => _sachRepository.DeleteAsync(id);

    private static BookDto MapToDto(Sach s)
    {
        var firstCategory = s.Gom.FirstOrDefault()?.DanhMuc;
        return new BookDto
        {
            Id = s.MaSach,
            Title = s.TenSach,
            Author = s.TacGia ?? "",
            Description = s.NoiDungDemo ?? "",
            Price = s.GiaBan,
            StockQuantity = s.SoLuongTon,
            ImageUrl = s.AnhSach ?? "",
            CategoryId = firstCategory?.MaDanhMuc ?? "",
            CategoryName = firstCategory?.TenDanhMuc ?? ""
        };
    }
}
