using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("DANHMUC")]
public class DanhMuc
{
    [Key, Column("MADANHMUC"), MaxLength(20)]
    public string MaDanhMuc { get; set; } = string.Empty;

    [Column("TENDANHMUC"), Required, MaxLength(100)]
    public string TenDanhMuc { get; set; } = string.Empty;

    [Column("MOTA"), MaxLength(255)]
    public string? MoTa { get; set; }

    public ICollection<Gom> Gom { get; set; } = new List<Gom>();
}
