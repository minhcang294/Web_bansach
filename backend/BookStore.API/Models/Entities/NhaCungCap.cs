using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models
{
    [Table("NHACUNGCAP")]
    public class NhaCungCap
    {
        [Key]
        [Column("MANHACUNGCAP")]
        [StringLength(30)]
        public string MaNhaCungCap { get; set; }

        [Required]
        [Column("TENNHACUNGCAP")]
        [StringLength(150)]
        public string TenNhaCungCap { get; set; }

        [Column("MOTA")]
        [StringLength(255)]
        public string MoTa { get; set; }

        // --- 3 CỘT MỚI THÊM VÀO ---
        [Column("SODIENTHOAI")]
        [StringLength(15)]
        public string SoDienThoai { get; set; }

        [Column("EMAIL")]
        [StringLength(100)]
        public string Email { get; set; }

        [Column("DIACHI")]
        [StringLength(200)]
        public string DiaChi { get; set; }
    }
}