using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("SACH")]
public class Sach
{
    [Key, Column("MASACH"), MaxLength(20)]
    public string MaSach { get; set; } = string.Empty;

    [Column("TENSACH"), Required, MaxLength(200)]
    public string TenSach { get; set; } = string.Empty;

    [Column("TACGIA"), MaxLength(100)]
    public string? TacGia { get; set; }

    [Column("GIABAN", TypeName = "decimal(18,2)")]
    public decimal GiaBan { get; set; }

    [Column("SOLUONGTON")]
    public int SoLuongTon { get; set; }

    [Column("NOIDUNGDEMO"), MaxLength(2000)]
    public string? NoiDungDemo { get; set; }

    [Column("LOAISACH"), MaxLength(50)]
    public string? LoaiSach { get; set; }

    [Column("NAMXUATBAN")]
    public int? NamXuatBan { get; set; }

    [Column("SOTRANG")]
    public int? SoTrang { get; set; }

    [Column("NGONNGU"), MaxLength(30)]
    public string? NgonNgu { get; set; }

    [Column("ANHSACH"), MaxLength(500)]
    public string? AnhSach { get; set; }

    public ICollection<Gom> Gom { get; set; } = new List<Gom>();
}
