using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities;

[Table("NHANVIEN")]
public class NhanVien
{
    [Key, Column("MANHANVIEN"), MaxLength(20)]
    public string MaNhanVien { get; set; } = string.Empty;

    [Column("TENDANGNHAP"), Required, MaxLength(50)]
    public string TenDangNhap { get; set; } = string.Empty;

    [Column("MATKHAU"), Required, MaxLength(200)]
    public string MatKhau { get; set; } = string.Empty;

    [Column("TENNV"), MaxLength(100)]
    public string? TenNv { get; set; }

    [Column("NGAYSINH")]
    public DateTime? NgaySinh { get; set; }

    [Column("GIOITINH"), MaxLength(10)]
    public string? GioiTinh { get; set; }

    [Column("EMAIL"), Required, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Column("SODT"), MaxLength(15)]
    public string? SoDt { get; set; }

    [Column("DIACHINV"), MaxLength(200)]
    public string? DiaChiNv { get; set; }

    [Column("VAITROPHUTRACH"), MaxLength(30)]
    public string VaiTroPhuTrach { get; set; } = "Staff"; // "Admin" | "Staff"

    // THUỘC TÍNH MỚI ĐÃ THÊM ĐỂ PHÂN QUYỀN
    [Column("ROLE"), MaxLength(20)]
    public string Role { get; set; } = "Staff";

    [Column("TRANGTHAILAMVIEC"), MaxLength(30)]
    public string? TrangThaiLamViec { get; set; }

    [Column("TRANGTHAI")]
    public int TrangThai { get; set; } = 1;
}