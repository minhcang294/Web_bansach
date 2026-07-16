using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

// Bảng MỚI (schema gốc chưa có) - lưu giỏ hàng của khách trước khi đặt hàng
[Table("GIOHANG")]
public class GioHang
{
    [Column("MAGIOHANG")]
    public int MaGioHang { get; set; }

    [Column("MAKHACHHANG")]
    public string MaKhachHang { get; set; } = string.Empty;
    public KhachHang? KhachHang { get; set; }

    [Column("MASACH")]
    public string MaSach { get; set; } = string.Empty;
    public Sach? Sach { get; set; }

    [Column("SOLUONG")]
    public int SoLuong { get; set; }
}
