using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("KHUYENMAI")]
public class KhuyenMai
{
    [Key, Column("MAKHUYENMAI"), MaxLength(20)]
    public string MaKhuyenMai { get; set; } = string.Empty;

    [Column("MAGIAMGIA"), MaxLength(20)]
    public string? MaGiamGia { get; set; }

    [Column("MUCGIAM", TypeName = "decimal(5,2)")]
    public decimal? MucGiam { get; set; }

    [Column("NGAYBATDAU")]
    public DateTime? NgayBatDau { get; set; }

    [Column("NGAYKETTHUC")]
    public DateTime? NgayKetThuc { get; set; }

    [Column("LAGIVEAWAY")]
    public bool LaGiveaway { get; set; }
}
