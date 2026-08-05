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
        // 🌟 Gọi hàm GetEffectiveId() để bắt trọn mã người dùng nhập từ Frontend
        string inputId = dto.GetEffectiveId();
        
        var maSach = string.IsNullOrWhiteSpace(inputId) 
            ? "S" + DateTime.UtcNow.Ticks.ToString()[^9..] 
            : inputId;

        var sach = new Sach
        {
            MaSach = maSach,
            TenSach = dto.Title,
            TacGia = dto.Author,
            NoiDungDemo = dto.Description,
            GiaBan = dto.Price,
            SoLuongTon = dto.StockQuantity,
            AnhSach = dto.ImageUrl,
            
            GiamGia = dto.Discount,
            MaNhaCungCap = dto.MaNhaCungCap,
            
            NhaCungCap = dto.Supplier,
            NguoiDich = dto.Translator,
            NhaXuatBan = dto.Publisher,
            NamXuatBan = dto.PublishYear,
            NgonNgu = dto.Language,
            TrongLuong = dto.Weight,
            KichThuoc = dto.Dimensions,
            SoTrang = dto.Pages,
            HinhThuc = dto.CoverType
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

        sach.GiamGia = dto.Discount;
        sach.MaNhaCungCap = dto.MaNhaCungCap;

        sach.NhaCungCap = dto.Supplier;
        sach.NguoiDich = dto.Translator;
        sach.NhaXuatBan = dto.Publisher;
        sach.NamXuatBan = dto.PublishYear;
        sach.NgonNgu = dto.Language;
        sach.TrongLuong = dto.Weight;
        sach.KichThuoc = dto.Dimensions;
        sach.SoTrang = dto.Pages;
        sach.HinhThuc = dto.CoverType;

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
            
            Discount = s.GiamGia,
            MaNhaCungCap = s.MaNhaCungCap,
            
            StockQuantity = s.SoLuongTon,
            ImageUrl = s.AnhSach ?? "",
            CategoryId = firstCategory?.MaDanhMuc ?? "",
            CategoryName = firstCategory?.TenDanhMuc ?? "",

            Supplier = s.NhaCungCap,
            Translator = s.NguoiDich,
            Publisher = s.NhaXuatBan,
            PublishYear = s.NamXuatBan,
            Language = s.NgonNgu,
            Weight = s.TrongLuong,
            Dimensions = s.KichThuoc,
            Pages = s.SoTrang,
            CoverType = s.HinhThuc
        };
    }
}