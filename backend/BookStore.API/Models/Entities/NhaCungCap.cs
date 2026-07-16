using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("NHACUNGCAP")]
public class NhaCungCap
{
    [Key, Column("MANHACUNGCAP"), MaxLength(30)]
    public string MaNhaCungCap { get; set; } = string.Empty;

    [Column("TENNHACUNGCAP"), Required, MaxLength(150)]
    public string TenNhaCungCap { get; set; } = string.Empty;

    [Column("MOTA"), MaxLength(255)]
    public string? MoTa { get; set; }
}
