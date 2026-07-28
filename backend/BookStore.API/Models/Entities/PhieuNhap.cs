using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("PHIEUNHAP")]
public class PhieuNhap
{
    [Key, Column("MAPHIEUNHAP"), MaxLength(20)]
    public string MaPhieuNhap { get; set; } = string.Empty;

    [Column("MANHACUNGCAP"), Required, MaxLength(30)]
    public string MaNhaCungCap { get; set; } = string.Empty;

    [ForeignKey("MaNhaCungCap")]
    public NhaCungCap? NhaCungCap { get; set; }

    [Column("MANHANVIEN"), Required, MaxLength(20)]
    public string MaNhanVien { get; set; } = string.Empty;

    [ForeignKey("MaNhanVien")]
    public NhanVien? NhanVien { get; set; }

    [Column("NGAYNHAP")]
    public DateTime NgayNhap { get; set; } = DateTime.Now;

    [Column("TONGTIEN", TypeName = "decimal(18,2)")]
    public decimal TongTien { get; set; } = 0;

    // Quan hệ 1-n với chi tiết phiếu nhập
    public ICollection<ChiTietPhieuNhap> ChiTietPhieuNhaps { get; set; } = new List<ChiTietPhieuNhap>();
}