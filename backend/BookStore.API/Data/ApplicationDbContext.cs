using BookStore.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // ===== DANH SÁCH CÁC BẢNG TRONG DATABASE =====
    public DbSet<Sach> Saches => Set<Sach>();
    public DbSet<DanhMuc> DanhMucs => Set<DanhMuc>();
    public DbSet<Gom> Goms => Set<Gom>();
    public DbSet<NhaCungCap> NhaCungCaps => Set<NhaCungCap>();
    public DbSet<KhachHang> KhachHangs => Set<KhachHang>();
    public DbSet<NhanVien> NhanViens => Set<NhanVien>();
    public DbSet<KhuyenMai> KhuyenMais => Set<KhuyenMai>();
    public DbSet<GioHang> GioHangs => Set<GioHang>();
    public DbSet<HoaDon> HoaDons => Set<HoaDon>();
    public DbSet<ChiTietHoaDon> ChiTietHoaDons => Set<ChiTietHoaDon>();
    
    // BỔ SUNG CHO MỤC NHẬP KHO
    public DbSet<PhieuNhap> PhieuNhaps => Set<PhieuNhap>();
    public DbSet<ChiTietPhieuNhap> ChiTietPhieuNhaps => Set<ChiTietPhieuNhap>();

    // BỔ SUNG CHO MỤC NHẬT KÝ HOẠT ĐỘNG (MỚI)
   public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ===== DANHMUC: Cấu hình liên kết Cha - Con (Tự tham chiếu) =====
        modelBuilder.Entity<DanhMuc>()
            .HasOne<DanhMuc>()
            .WithMany()
            .HasForeignKey(d => d.ParentId)
            .OnDelete(DeleteBehavior.NoAction);

        // ===== GOM: khóa chính kép Sách-DanhMục =====
        modelBuilder.Entity<Gom>().HasKey(g => new { g.MaSach, g.MaDanhMuc });
        modelBuilder.Entity<Gom>()
            .HasOne(g => g.Sach).WithMany(s => s.Gom).HasForeignKey(g => g.MaSach);
        modelBuilder.Entity<Gom>()
            .HasOne(g => g.DanhMuc).WithMany(d => d.Gom).HasForeignKey(g => g.MaDanhMuc);

        // ===== KHACHHANG: email và tên đăng nhập là duy nhất =====
        modelBuilder.Entity<KhachHang>().HasIndex(k => k.Email).IsUnique();
        modelBuilder.Entity<KhachHang>().HasIndex(k => k.TenDangNhap).IsUnique();

        modelBuilder.Entity<NhanVien>().HasIndex(n => n.Email).IsUnique();
        modelBuilder.Entity<NhanVien>().HasIndex(n => n.TenDangNhap).IsUnique();

        // ===== GIOHANG: mỗi khách chỉ có 1 dòng giỏ hàng cho mỗi sách =====
        modelBuilder.Entity<GioHang>().HasKey(g => g.MaGioHang);
        modelBuilder.Entity<GioHang>().Property(g => g.MaGioHang).ValueGeneratedOnAdd();
        modelBuilder.Entity<GioHang>().HasIndex(g => new { g.MaKhachHang, g.MaSach }).IsUnique();
        modelBuilder.Entity<GioHang>()
            .HasOne(g => g.KhachHang).WithMany().HasForeignKey(g => g.MaKhachHang);
        modelBuilder.Entity<GioHang>()
            .HasOne(g => g.Sach).WithMany().HasForeignKey(g => g.MaSach);

        // ===== HOADON =====
        modelBuilder.Entity<HoaDon>()
            .HasOne(h => h.KhachHang).WithMany().HasForeignKey(h => h.MaKhachHang);
        modelBuilder.Entity<HoaDon>()
            .HasOne(h => h.NhanVien).WithMany().HasForeignKey(h => h.MaNhanVien)
            .OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<HoaDon>()
            .HasOne(h => h.KhuyenMai).WithMany().HasForeignKey(h => h.MaKhuyenMai)
            .OnDelete(DeleteBehavior.SetNull);

        // ===== CHITIETHOADON =====
        modelBuilder.Entity<ChiTietHoaDon>().Property(c => c.MaCtHd).ValueGeneratedOnAdd();
        modelBuilder.Entity<ChiTietHoaDon>()
            .HasOne(c => c.HoaDon).WithMany(h => h.ChiTietHoaDons).HasForeignKey(c => c.MaHoaDon);
        modelBuilder.Entity<ChiTietHoaDon>()
            .HasOne(c => c.Sach).WithMany().HasForeignKey(c => c.MaSach);

        // ===== PHIEUNHAP & CHITIETPHIEUNHAP =====
        modelBuilder.Entity<PhieuNhap>()
            .HasOne(p => p.NhaCungCap).WithMany().HasForeignKey(p => p.MaNhaCungCap);
        modelBuilder.Entity<PhieuNhap>()
            .HasOne(p => p.NhanVien).WithMany().HasForeignKey(p => p.MaNhanVien);

        modelBuilder.Entity<ChiTietPhieuNhap>().Property(c => c.MaCtPn).ValueGeneratedOnAdd();
        modelBuilder.Entity<ChiTietPhieuNhap>()
            .HasOne(c => c.PhieuNhap).WithMany(p => p.ChiTietPhieuNhaps).HasForeignKey(c => c.MaPhieuNhap)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ChiTietPhieuNhap>()
            .HasOne(c => c.Sach).WithMany().HasForeignKey(c => c.MaSach);

        // Lưu ý: dữ liệu mẫu được chèn trực tiếp trong database/BANSACH_corrected.sql
    }
}