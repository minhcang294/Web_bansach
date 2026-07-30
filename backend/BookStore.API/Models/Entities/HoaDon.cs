using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("HOADON")]
public class HoaDon
{
    [Key, Column("MAHOADON"), MaxLength(20)]
    public string MaHoaDon { get; set; } = string.Empty;

    [Column("MANHANVIEN"), MaxLength(20)]
    public string? MaNhanVien { get; set; }
    
    [ForeignKey("MaNhanVien")]
    public NhanVien? NhanVien { get; set; }

    [Column("MAKHACHHANG"), Required, MaxLength(20)]
    public string MaKhachHang { get; set; } = string.Empty;
    
    [ForeignKey("MaKhachHang")] 
    public KhachHang? KhachHang { get; set; }

    [Column("MAKHUYENMAI"), MaxLength(20)]
    public string? MaKhuyenMai { get; set; }
    
    [ForeignKey("MaKhuyenMai")]
    public KhuyenMai? KhuyenMai { get; set; }

    [Column("NGAYDATHANG")]
    public DateTime NgayDatHang { get; set; } = DateTime.UtcNow;

    [Column("NGAYGIAHANG")] 
    public DateTime? NgayGiaoHang { get; set; }

    // ==========================================
    // 🌟 CÁC TRƯỜNG VỪA BỔ SUNG ĐỂ KHỚP VỚI REACT
    // ==========================================
    [Column("TENNGUOINHAN"), MaxLength(100)]
    public string TenNguoiNhan { get; set; } = string.Empty; // Tương ứng với CustomerName/FullName

    [Column("EMAIL"), MaxLength(100)]
    public string? Email { get; set; }

    [Column("PHUONGTHUCTHANHTOAN"), MaxLength(50)]
    public string PhuongThucThanhToan { get; set; } = "COD"; // Tương ứng với PaymentMethod

    [Column("GHICHU"), MaxLength(500)]
    public string? GhiChu { get; set; } // Tương ứng với Note
    // ==========================================

    [Column("DIACHIGIAOHANG"), Required, MaxLength(200)]
    public string DiaChiGiaoHang { get; set; } = string.Empty;

    [Column("SODIENTHOAINHAN"), Required, MaxLength(15)]
    public string SoDienThoaiNhan { get; set; } = string.Empty;

    [Column("TRANGTHAIGIAOHANG"), MaxLength(30)]
    public string TrangThaiGiaoHang { get; set; } = "Chờ xử lý"; 

    [Column("PHIVANCHUYEN", TypeName = "decimal(18,2)")]
    public decimal PhiVanChuyen { get; set; }

    [Column("GIAMGIA", TypeName = "decimal(18,2)")] 
    public decimal GiamGia { get; set; }

    [Column("TONGTIEN", TypeName = "decimal(18,2)")]
    public decimal TongTien { get; set; }

    public ICollection<ChiTietHoaDon> ChiTietHoaDons { get; set; } = new List<ChiTietHoaDon>();
}