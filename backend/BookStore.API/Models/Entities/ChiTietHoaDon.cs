using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("CHITIETHOADON")]
public class ChiTietHoaDon
{
    [Key, Column("MACTHD")]
    public int MaCtHd { get; set; }

    [Column("MAHOADON"), Required, MaxLength(20)]
    public string MaHoaDon { get; set; } = string.Empty;
    public HoaDon? HoaDon { get; set; }

    [Column("MASACH"), Required, MaxLength(20)]
    public string MaSach { get; set; } = string.Empty;
    public Sach? Sach { get; set; }

    [Column("SOLUONG")]
    public int SoLuong { get; set; }

    [Column("DONGIA", TypeName = "decimal(18,2)")]
    public decimal DonGia { get; set; }

    [Column("TONGTIEN", TypeName = "decimal(18,2)")]
    public decimal TongTien { get; set; }
}
