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

    // [ĐÃ BỔ SUNG]: Cột Giảm giá (%)
    [Column("GIAMGIA")]
    public int GiamGia { get; set; }

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

    // ==========================================
    // CÁC TRƯỜNG THÔNG TIN CHI TIẾT BỔ SUNG MỚI
    // ==========================================

    // [ĐÃ BỔ SUNG]: Cột Mã nhà cung cấp (Để lưu cái mã bạn chọn từ danh sách dropdown)
    [Column("MANHACUNGCAP"), MaxLength(30)]
    public string? MaNhaCungCap { get; set; }

    [Column("NHACUNGCAP"), MaxLength(150)]
    public string? NhaCungCap { get; set; }

    [Column("NGUOIDICH"), MaxLength(100)]
    public string? NguoiDich { get; set; }

    [Column("NHAXUATBAN"), MaxLength(150)]
    public string? NhaXuatBan { get; set; }

    [Column("TRONGLUONG")]
    public int? TrongLuong { get; set; }

    [Column("KICHTHUOC"), MaxLength(50)]
    public string? KichThuoc { get; set; }

    [Column("HINHTHUC"), MaxLength(50)]
    public string? HinhThuc { get; set; }

    public ICollection<Gom> Gom { get; set; } = new List<Gom>();
}