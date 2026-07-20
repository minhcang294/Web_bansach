using BookStore.API.Models.DTOs.Order;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using BookStore.API.Services.Interfaces;

namespace BookStore.API.Services.Implementations;

public class OrderService : IOrderService
{
    private readonly IHoaDonRepository _hoaDonRepository;
    private readonly IGioHangRepository _gioHangRepository;
    private readonly ISachRepository _sachRepository;

    public OrderService(IHoaDonRepository hoaDonRepository, IGioHangRepository gioHangRepository, ISachRepository sachRepository)
    {
        _hoaDonRepository = hoaDonRepository;
        _gioHangRepository = gioHangRepository;
        _sachRepository = sachRepository;
    }

    public async Task<OrderResponseDto> CreateOrderAsync(string maKhachHang, OrderCreateDto dto)
    {
        var cartItems = await _gioHangRepository.GetByKhachHangIdAsync(maKhachHang);
        if (cartItems == null || cartItems.Count == 0)
            throw new Exception("Giỏ hàng đang trống, không thể đặt hàng."); // Sử dụng Exception hoặc CartException của bạn

        // Kiểm tra lại tồn kho lần cuối trước khi chốt đơn
        foreach (var item in cartItems)
        {
            var sach = await _sachRepository.GetByIdAsync(item.MaSach);
            if (sach is null || sach.SoLuongTon < item.SoLuong)
                throw new Exception($"Sách \"{item.Sach?.TenSach}\" không đủ số lượng trong kho.");
        }

        var maHoaDon = "HD" + DateTime.UtcNow.Ticks.ToString()[^10..]; // sinh mã tự động
        var tongTien = cartItems.Sum(i => i.SoLuong * i.Sach!.GiaBan);

        var hoaDon = new HoaDon
        {
            MaHoaDon = maHoaDon,
            MaKhachHang = maKhachHang,
            MaNhanVien = null,       // đơn online, chưa có nhân viên xử lý
            MaKhuyenMai = null,      // chưa áp dụng khuyến mãi
            NgayDatHang = DateTime.UtcNow,
            DiaChiGiaoHang = dto.ShippingAddress,
            SoDienThoaiNhan = dto.PhoneNumber,
            TrangThaiGiaoHang = "ChoXuLy",
            PhiVanChuyen = 0,
            GiamGia = 0,
            TongTien = tongTien,
            ChiTietHoaDons = cartItems.Select(i => new ChiTietHoaDon
            {
                MaSach = i.MaSach,
                SoLuong = i.SoLuong,
                DonGia = i.Sach!.GiaBan,
                TongTien = i.SoLuong * i.Sach.GiaBan
            }).ToList()
        };

        var created = await _hoaDonRepository.AddAsync(hoaDon);

        // Trừ kho
        foreach (var item in cartItems)
        {
            var sach = await _sachRepository.GetByIdAsync(item.MaSach);
            if (sach != null)
            {
                sach.SoLuongTon -= item.SoLuong;
                await _sachRepository.UpdateAsync(sach, sach.Gom.FirstOrDefault()?.MaDanhMuc ?? "");
            }
        }

        await _gioHangRepository.ClearAsync(maKhachHang);

        var full = await _hoaDonRepository.GetByIdAsync(created.MaHoaDon, maKhachHang);
        return MapToDto(full!);
    }

    public async Task<List<OrderResponseDto>> GetMyOrdersAsync(string maKhachHang)
    {
        var orders = await _hoaDonRepository.GetByKhachHangIdAsync(maKhachHang);
        return orders?.Select(MapToDto).ToList() ?? new List<OrderResponseDto>();
    }

    public async Task<OrderResponseDto?> GetByIdAsync(string maKhachHang, string orderId)
    {
        var order = await _hoaDonRepository.GetByIdAsync(orderId, maKhachHang);
        return order is null ? null : MapToDto(order);
    }

    // ====================================================================
    // CÁC HÀM MỚI BỔ SUNG CHO ADMIN
    // ====================================================================

    public async Task<List<OrderResponseDto>> GetAllOrdersAsync()
    {
        // Lấy tất cả danh sách hóa đơn từ Database
        var orders = await _hoaDonRepository.GetAllAsync();
        return orders?.Select(MapToDto).ToList() ?? new List<OrderResponseDto>();
    }

    public async Task UpdateStatusAsync(string orderId, string status)
    {
        // Admin chỉ cần truyền OrderId để lấy ra hóa đơn, không cần mã khách hàng
        // Lưu ý: Đảm bảo Repository của bạn có hàm GetByIdAsync nhận 1 tham số
        var order = await _hoaDonRepository.GetByIdAsync(orderId); 
        
        if (order == null)
        {
            throw new Exception("Không tìm thấy đơn hàng.");
        }

        order.TrangThaiGiaoHang = status;
        await _hoaDonRepository.UpdateAsync(order);
    }

    // ====================================================================

    private static OrderResponseDto MapToDto(HoaDon h) => new()
    {
        Id = h.MaHoaDon,
        OrderDate = h.NgayDatHang,
        Status = h.TrangThaiGiaoHang,
        TotalAmount = h.TongTien,
        ShippingAddress = h.DiaChiGiaoHang,
        PhoneNumber = h.SoDienThoaiNhan,
        
        // Bổ sung các trường an toàn, tránh lỗi NullReference
        Items = h.ChiTietHoaDons?.Select(c => new OrderDetailDto
        {
            BookTitle = c.Sach?.TenSach ?? "Sách không xác định",
            ImageUrl = c.Sach?.AnhSach ?? "",
            Quantity = c.SoLuong,
            UnitPrice = c.DonGia
        }).ToList() ?? new List<OrderDetailDto>()
    };
}