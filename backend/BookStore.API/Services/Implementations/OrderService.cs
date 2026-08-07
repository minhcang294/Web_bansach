using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
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
    private readonly IEmailService _emailService; 

    public OrderService(
        IHoaDonRepository hoaDonRepository, 
        IGioHangRepository gioHangRepository, 
        ISachRepository sachRepository,
        IEmailService emailService) 
    {
        _hoaDonRepository = hoaDonRepository;
        _gioHangRepository = gioHangRepository;
        _sachRepository = sachRepository;
        _emailService = emailService;
    }

    public async Task<OrderResponseDto> CreateOrderAsync(string maKhachHang, OrderCreateDto dto)
    {
        var cartItems = await _gioHangRepository.GetByKhachHangIdAsync(maKhachHang);
        if (cartItems == null || !cartItems.Any())
            throw new Exception("Giỏ hàng đang trống, không thể đặt hàng."); 

        foreach (var item in cartItems)
        {
            var sach = await _sachRepository.GetByIdAsync(item.MaSach);
            if (sach == null || sach.SoLuongTon < item.SoLuong)
                throw new Exception($"Sách \"{item.Sach?.TenSach ?? item.MaSach}\" không đủ số lượng trong kho.");
        }

        var maHoaDon = "HD" + DateTime.UtcNow.Ticks.ToString()[^10..]; 
        var tongTien = cartItems.Sum(i => i.SoLuong * (i.Sach?.GiaBan ?? 0));

        var hoaDon = new HoaDon
        {
            MaHoaDon = maHoaDon,
            MaKhachHang = maKhachHang,
            MaNhanVien = null,      
            MaKhuyenMai = null,      
            NgayDatHang = DateTime.Now,
            
            // 🌟 ÁNH XẠ DỮ LIỆU TỪ DTO VÀO ENTITY
            TenNguoiNhan = dto.CustomerName ?? "",
            Email = dto.Email,
            PhuongThucThanhToan = dto.PaymentMethod ?? "COD",
            GhiChu = dto.Note,
            // 🌟 =================================
            
            DiaChiGiaoHang = dto.ShippingAddress ?? "",
            SoDienThoaiNhan = dto.PhoneNumber ?? "",
            TrangThaiGiaoHang = "Chờ xử lý", 
            PhiVanChuyen = 0,
            GiamGia = 0,
            TongTien = tongTien,
            ChiTietHoaDons = cartItems.Select(i => new ChiTietHoaDon
            {
                MaSach = i.MaSach,
                SoLuong = i.SoLuong,
                DonGia = i.Sach?.GiaBan ?? 0,
                TongTien = i.SoLuong * (i.Sach?.GiaBan ?? 0)
            }).ToList()
        };

        var created = await _hoaDonRepository.AddAsync(hoaDon);

        foreach (var item in cartItems)
        {
            var sach = await _sachRepository.GetByIdAsync(item.MaSach);
            if (sach != null)
            {
                sach.SoLuongTon -= item.SoLuong;
                var danhMucId = sach.Gom?.FirstOrDefault()?.MaDanhMuc ?? "VH01";
                await _sachRepository.UpdateAsync(sach, danhMucId);
            }
        }

        await _gioHangRepository.ClearAsync(maKhachHang);

        var full = await _hoaDonRepository.GetByIdAsync(created.MaHoaDon, maKhachHang);

        // 🌟 GỬI EMAIL TỰ ĐỘNG (Ưu tiên lấy email ở form Đặt hàng)
        string targetEmail = full?.Email ?? full?.KhachHang?.Email;
        string targetName = full?.TenNguoiNhan ?? full?.KhachHang?.HoTenKh ?? "Quý khách";

        if (!string.IsNullOrEmpty(targetEmail))
        {
            try
            {
                string emailSubject = $"Xác nhận đặt hàng thành công #{full.MaHoaDon} - BookGalaxy";
                string emailBody = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
                        <h2 style='color: #e74c3c; text-align: center;'>BookGalaxy</h2>
                        <h3>Xin chào {targetName},</h3>
                        <p>Cảm ơn bạn đã đặt hàng tại BookGalaxy! Đơn hàng của bạn đã được ghi nhận thành công và đang ở trạng thái <b>Chờ xử lý</b>.</p>
                        
                        <div style='background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;'>
                            <p><b>Mã đơn hàng:</b> {full.MaHoaDon}</p>
                            <p><b>Ngày đặt:</b> {full.NgayDatHang.ToString("dd/MM/yyyy HH:mm")}</p>
                            <p><b>Phương thức thanh toán:</b> {full.PhuongThucThanhToan}</p>
                            <p><b>Địa chỉ nhận:</b> {full.DiaChiGiaoHang}</p>
                            <p><b>SĐT liên hệ:</b> {full.SoDienThoaiNhan}</p>
                        </div>

                        <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                            <thead>
                                <tr style='background-color: #f3f4f6;'>
                                    <th style='padding: 10px; border: 1px solid #d1d5db; text-align: left;'>Sản phẩm</th>
                                    <th style='padding: 10px; border: 1px solid #d1d5db; text-align: center;'>SL</th>
                                    <th style='padding: 10px; border: 1px solid #d1d5db; text-align: right;'>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>";

                if (full.ChiTietHoaDons != null)
                {
                    foreach (var detail in full.ChiTietHoaDons)
                    {
                        emailBody += $@"
                                <tr>
                                    <td style='padding: 10px; border: 1px solid #d1d5db;'>{detail.Sach?.TenSach ?? "Sách"}</td>
                                    <td style='padding: 10px; border: 1px solid #d1d5db; text-align: center;'>{detail.SoLuong}</td>
                                    <td style='padding: 10px; border: 1px solid #d1d5db; text-align: right;'>{(detail.DonGia * detail.SoLuong):N0} đ</td>
                                </tr>";
                    }
                }

                emailBody += $@"
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan='2' style='padding: 10px; text-align: right; font-weight: bold;'>Phí vận chuyển:</td>
                                    <td style='padding: 10px; text-align: right; border: 1px solid #d1d5db;'>{full.PhiVanChuyen:N0} đ</td>
                                </tr>
                                <tr>
                                    <td colspan='2' style='padding: 10px; text-align: right; font-weight: bold; color: #e74c3c;'>TỔNG CỘNG:</td>
                                    <td style='padding: 10px; text-align: right; border: 1px solid #d1d5db; font-weight: bold; color: #e74c3c;'>{full.TongTien:N0} đ</td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <p style='text-align: center; color: #6b7280; font-size: 12px;'>Đây là email tự động từ hệ thống BookGalaxy, vui lòng không trả lời.</p>
                    </div>";

                await _emailService.SendEmailAsync(targetEmail, emailSubject, emailBody);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi gửi email xác nhận đặt hàng: " + ex.Message);
            }
        }

        return MapToDto(full ?? created);
    }

    public async Task<List<OrderResponseDto>> GetMyOrdersAsync(string maKhachHang)
    {
        var orders = await _hoaDonRepository.GetByKhachHangIdAsync(maKhachHang);
        return orders?.Where(o => o != null).Select(MapToDto).ToList() ?? new List<OrderResponseDto>();
    }

    public async Task<OrderResponseDto?> GetByIdAsync(string maKhachHang, string orderId)
    {
        var order = await _hoaDonRepository.GetByIdAsync(orderId, maKhachHang);
        return order == null ? null : MapToDto(order);
    }

    public async Task<OrderResponseDto?> GetByIdForAdminAsync(string orderId)
    {
        var order = await _hoaDonRepository.GetByIdAsync(orderId);
        return order == null ? null : MapToDto(order);
    }

    public async Task<List<OrderResponseDto>> GetAllOrdersAsync()
    {
        try 
        {
            var orders = await _hoaDonRepository.GetAllAsync();
            return orders?.Where(o => o != null).Select(MapToDto).ToList() ?? new List<OrderResponseDto>();
        }
        catch (Exception ex)
        {
            throw new Exception("Lỗi EF Core khi truy vấn dữ liệu Hóa Đơn: " + ex.Message, ex);
        }
    }

    public async Task<OrderDashboardStatDto> GetStaffDashboardStatsAsync()
    {
        var allOrders = await _hoaDonRepository.GetAllAsync() ?? new List<HoaDon>();
        var allBooks = await _sachRepository.GetAllAsync() ?? new List<Sach>();
        
        return new OrderDashboardStatDto
        {
            PendingOrders = allOrders.Count(o => o != null && o.TrangThaiGiaoHang == "Chờ xử lý"),
            ShippingOrders = allOrders.Count(o => o != null && o.TrangThaiGiaoHang == "Đang giao"),
            CompletedToday = allOrders.Count(o => o != null && o.TrangThaiGiaoHang == "Hoàn tất" && o.NgayDatHang.Date == DateTime.UtcNow.Date),
            LowStockBooks = allBooks.Count(b => b != null && b.SoLuongTon < 5) 
        };
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetRecentOrdersAsync(string? search, string? status)
    {
        var allOrders = await _hoaDonRepository.GetAllAsync() ?? new List<HoaDon>();
        var query = allOrders.Where(o => o != null).AsEnumerable();

        if (!string.IsNullOrEmpty(status) && status != "Tất cả")
        {
            query = query.Where(o => o.TrangThaiGiaoHang == status);
        }

        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(o => 
                (o.MaHoaDon?.ToLower().Contains(search) == true) || 
                (o.SoDienThoaiNhan?.Contains(search) == true)
            );
        }

        var result = query.OrderByDescending(o => o.NgayDatHang).Select(o => new OrderSummaryDto
        {
            Id = o.MaHoaDon ?? "N/A",
            // 🌟 Lấy tên từ Hóa Đơn (nếu có), không có mới lấy tên Tài khoản
            CustomerName = !string.IsNullOrEmpty(o.TenNguoiNhan) ? o.TenNguoiNhan : (o.KhachHang?.HoTenKh ?? "Khách hàng"),
            Phone = o.SoDienThoaiNhan ?? "",
            ItemSummary = o.ChiTietHoaDons != null && o.ChiTietHoaDons.Any() 
                          ? (o.ChiTietHoaDons.FirstOrDefault()?.Sach?.TenSach + 
                            (o.ChiTietHoaDons.Count > 1 ? $" (+{o.ChiTietHoaDons.Count - 1})" : ""))
                          : "Đang cập nhật",
            Total = o.TongTien,
            Status = o.TrangThaiGiaoHang ?? "Chờ xử lý",
            OrderDate = o.NgayDatHang
        });

        return result.Take(50);
    }

    public async Task UpdateStatusAsync(string orderId, string status)
    {
        var order = await _hoaDonRepository.GetByIdAsync(orderId); 
        
        if (order == null)
            throw new Exception("Không tìm thấy đơn hàng.");

        order.TrangThaiGiaoHang = status;
        
        if (status == "Hoàn tất") 
        {
            order.NgayGiaoHang = DateTime.UtcNow; 
        }

        await _hoaDonRepository.UpdateAsync(order);

        string targetEmail = order.Email ?? order.KhachHang?.Email;
        string targetName = order.TenNguoiNhan ?? order.KhachHang?.HoTenKh ?? "Quý khách";

        if ((status == "Đã xác nhận" || status == "Hoàn tất" || status == "Đang giao") && !string.IsNullOrEmpty(targetEmail))
        {
            string emailSubject = status == "Hoàn tất" ? $"Hóa đơn mua hàng {order.MaHoaDon} - BookGalaxy" : $"Cập nhật đơn hàng {order.MaHoaDon} - BookGalaxy";
            
            string statusMessage = status switch {
                "Đã xác nhận" => "Đơn hàng của bạn đã được xác nhận và đang được đóng gói.",
                "Đang giao" => "Đơn hàng của bạn đang trên đường giao đến bạn. Vui lòng chú ý điện thoại!",
                "Hoàn tất" => "Đơn hàng đã giao thành công. Cảm ơn bạn đã mua sắm tại BookGalaxy!",
                _ => "Đơn hàng của bạn đã được cập nhật."
            };

            string emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
                    <h2 style='color: #e74c3c; text-align: center;'>BookGalaxy</h2>
                    <h3>Xin chào {targetName},</h3>
                    <p>{statusMessage}</p>
                    
                    <div style='background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;'>
                        <p><b>Mã đơn hàng:</b> {order.MaHoaDon}</p>
                        <p><b>Ngày đặt:</b> {order.NgayDatHang.ToString("dd/MM/yyyy HH:mm")}</p>
                        <p><b>Địa chỉ nhận:</b> {order.DiaChiGiaoHang}</p>
                        <p><b>SĐT liên hệ:</b> {order.SoDienThoaiNhan}</p>
                    </div>

                    <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                        <thead>
                            <tr style='background-color: #f3f4f6;'>
                                <th style='padding: 10px; border: 1px solid #d1d5db; text-align: left;'>Sản phẩm</th>
                                <th style='padding: 10px; border: 1px solid #d1d5db; text-align: center;'>SL</th>
                                <th style='padding: 10px; border: 1px solid #d1d5db; text-align: right;'>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>";

            if (order.ChiTietHoaDons != null)
            {
                foreach (var detail in order.ChiTietHoaDons)
                {
                    emailBody += $@"
                            <tr>
                                <td style='padding: 10px; border: 1px solid #d1d5db;'>{detail.Sach?.TenSach ?? "Sách"}</td>
                                <td style='padding: 10px; border: 1px solid #d1d5db; text-align: center;'>{detail.SoLuong}</td>
                                <td style='padding: 10px; border: 1px solid #d1d5db; text-align: right;'>{(detail.DonGia * detail.SoLuong):N0} đ</td>
                            </tr>";
                }
            }

            emailBody += $@"
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan='2' style='padding: 10px; text-align: right; font-weight: bold;'>Phí vận chuyển:</td>
                                <td style='padding: 10px; text-align: right; border: 1px solid #d1d5db;'>{order.PhiVanChuyen:N0} đ</td>
                            </tr>
                            <tr>
                                <td colspan='2' style='padding: 10px; text-align: right; font-weight: bold; color: #e74c3c;'>TỔNG CỘNG:</td>
                                <td style='padding: 10px; text-align: right; border: 1px solid #d1d5db; font-weight: bold; color: #e74c3c;'>{order.TongTien:N0} đ</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <p style='text-align: center; color: #6b7280; font-size: 12px;'>Đây là email tự động từ hệ thống BookGalaxy, vui lòng không trả lời.</p>
                </div>";

            await _emailService.SendEmailAsync(targetEmail, emailSubject, emailBody);
        }
    }

    private static OrderResponseDto MapToDto(HoaDon h)
    {
        if (h == null) return new OrderResponseDto();

        return new OrderResponseDto
        {
            Id = h.MaHoaDon ?? "",
            OrderDate = h.NgayDatHang,
            Status = h.TrangThaiGiaoHang ?? "Chờ xử lý",
            TotalAmount = h.TongTien,
            ShippingAddress = h.DiaChiGiaoHang ?? "",
            PhoneNumber = h.SoDienThoaiNhan ?? "",
            
            // 🌟 ĐÃ SỬA: Lấy Tên/Email người nhận. Nếu rỗng thì lấy tên/email của Tài khoản đăng ký
            CustomerName = !string.IsNullOrEmpty(h.TenNguoiNhan) ? h.TenNguoiNhan : (h.KhachHang?.HoTenKh ?? "Khách hàng"),
            Email = !string.IsNullOrEmpty(h.Email) ? h.Email : (h.KhachHang?.Email ?? ""),
            
            PaymentMethod = h.PhuongThucThanhToan ?? "COD",
            Note = h.GhiChu,

            Items = h.ChiTietHoaDons?.Where(c => c != null).Select(c => new OrderDetailDto
            {
                BookTitle = c.Sach?.TenSach ?? "Sách không xác định",
                ImageUrl = c.Sach?.AnhSach ?? "",
                Quantity = c.SoLuong,
                UnitPrice = c.DonGia
            }).ToList() ?? new List<OrderDetailDto>()
        };
    }
}