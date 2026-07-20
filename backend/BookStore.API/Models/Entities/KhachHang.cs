using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("KHACHHANG")]
public class KhachHang
{
    [Key, Column("MAKHACHHANG"), MaxLength(20)]
    public string MaKhachHang { get; set; } = string.Empty;

    [Column("TENDANGNHAP"), Required, MaxLength(50)]
    public string TenDangNhap { get; set; } = string.Empty;

    [Column("MATKHAU"), Required, MaxLength(200)]
    public string MatKhau { get; set; } = string.Empty; // lưu chuỗi đã BCrypt hash

    [Column("HOTENKH"), MaxLength(100)]
    public string? HoTenKh { get; set; }

    [Column("EMAIL"), Required, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Column("SODIENTHOAI"), MaxLength(15)]
    public string? SoDienThoai { get; set; }

    [Column("DIACHIKH"), MaxLength(200)]
    public string? DiaChiKh { get; set; }

    [Column("NGAYDK")]
    public DateTime NgayDk { get; set; } = DateTime.UtcNow;

    [Column("TRANGTHAI")]
    public int TrangThai { get; set; } = 1; // 1 = hoạt động, 0 = khóa
}