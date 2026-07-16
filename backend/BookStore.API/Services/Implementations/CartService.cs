using BookStore.API.Models.DTOs.Cart;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using BookStore.API.Services.Interfaces;

namespace BookStore.API.Services.Implementations;

public class CartService : ICartService
{
    private readonly IGioHangRepository _gioHangRepository;
    private readonly ISachRepository _sachRepository;

    public CartService(IGioHangRepository gioHangRepository, ISachRepository sachRepository)
    {
        _gioHangRepository = gioHangRepository;
        _sachRepository = sachRepository;
    }

    public async Task<CartResponseDto> GetCartAsync(string maKhachHang)
    {
        var items = await _gioHangRepository.GetByKhachHangIdAsync(maKhachHang);
        return MapToDto(items);
    }

    public async Task<CartResponseDto> AddToCartAsync(string maKhachHang, AddToCartDto dto)
    {
        var sach = await _sachRepository.GetByIdAsync(dto.BookId)
            ?? throw new CartException("Sách không tồn tại.", 404);

        var existing = await _gioHangRepository.GetItemAsync(maKhachHang, dto.BookId);
        var currentQty = existing?.SoLuong ?? 0;

        if (currentQty + dto.Quantity > sach.SoLuongTon)
            throw new CartException($"Chỉ còn {sach.SoLuongTon} cuốn trong kho.", 400);

        if (existing is not null)
        {
            existing.SoLuong += dto.Quantity;
            await _gioHangRepository.UpdateAsync(existing);
        }
        else
        {
            await _gioHangRepository.AddAsync(new GioHang { MaKhachHang = maKhachHang, MaSach = dto.BookId, SoLuong = dto.Quantity });
        }

        return await GetCartAsync(maKhachHang);
    }

    public async Task<CartResponseDto> UpdateItemAsync(string maKhachHang, int cartItemId, UpdateCartItemDto dto)
    {
        var item = await _gioHangRepository.GetByIdAsync(cartItemId, maKhachHang)
            ?? throw new CartException("Không tìm thấy sản phẩm trong giỏ.", 404);

        if (dto.Quantity > item.Sach!.SoLuongTon)
            throw new CartException($"Chỉ còn {item.Sach.SoLuongTon} cuốn trong kho.", 400);

        item.SoLuong = dto.Quantity;
        await _gioHangRepository.UpdateAsync(item);
        return await GetCartAsync(maKhachHang);
    }

    public async Task<CartResponseDto> RemoveItemAsync(string maKhachHang, int cartItemId)
    {
        var item = await _gioHangRepository.GetByIdAsync(cartItemId, maKhachHang)
            ?? throw new CartException("Không tìm thấy sản phẩm trong giỏ.", 404);

        await _gioHangRepository.RemoveAsync(item);
        return await GetCartAsync(maKhachHang);
    }

    private static CartResponseDto MapToDto(List<GioHang> items) => new()
    {
        Items = items.Select(i => new CartItemDto
        {
            Id = i.MaGioHang,
            BookId = i.MaSach,
            Title = i.Sach?.TenSach ?? "",
            ImageUrl = i.Sach?.AnhSach ?? "",
            Price = i.Sach?.GiaBan ?? 0,
            Quantity = i.SoLuong,
            StockQuantity = i.Sach?.SoLuongTon ?? 0
        }).ToList()
    };
}
