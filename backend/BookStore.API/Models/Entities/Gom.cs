using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

// Bảng trung gian Sách - Danh mục (n-n)
[Table("GOM")]
public class Gom
{
    [Column("MASACH"), MaxLength(20)]
    public string MaSach { get; set; } = string.Empty;
    public Sach? Sach { get; set; }

    [Column("MADANHMUC"), MaxLength(20)]
    public string MaDanhMuc { get; set; } = string.Empty;
    public DanhMuc? DanhMuc { get; set; }
}
