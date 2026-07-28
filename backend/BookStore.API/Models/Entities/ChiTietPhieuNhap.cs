using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("CHITIETPHIEUNHAP")]
public class ChiTietPhieuNhap
{
    [Key, Column("MACTPN")]
    public int MaCtPn { get; set; }

    [Column("MAPHIEUNHAP"), Required, MaxLength(20)]
    public string MaPhieuNhap { get; set; } = string.Empty;

    [ForeignKey("MaPhieuNhap")]
    public PhieuNhap? PhieuNhap { get; set; }

    [Column("MASACH"), Required, MaxLength(20)]
    public string MaSach { get; set; } = string.Empty;

    [ForeignKey("MaSach")]
    public Sach? Sach { get; set; }

    [Column("SOLUONGNHAP")]
    public int SoLuongNhap { get; set; }

    [Column("GIANHAP", TypeName = "decimal(18,2)")]
    public decimal GiaNhap { get; set; }

    [Column("THANHTIEN", TypeName = "decimal(18,2)")]
    public decimal ThanhTien { get; set; }
}