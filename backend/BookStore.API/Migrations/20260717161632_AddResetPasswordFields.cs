using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddResetPasswordFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DANHMUC",
                columns: table => new
                {
                    MADANHMUC = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TENDANHMUC = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MOTA = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DANHMUC", x => x.MADANHMUC);
                });

            migrationBuilder.CreateTable(
                name: "KHACHHANG",
                columns: table => new
                {
                    MAKHACHHANG = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TENDANGNHAP = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MATKHAU = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    HOTENKH = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EMAIL = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SODIENTHOAI = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    DIACHIKH = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    NGAYDK = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TRANGTHAI = table.Column<int>(type: "int", nullable: false),
                    ResetToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResetTokenExpiry = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KHACHHANG", x => x.MAKHACHHANG);
                });

            migrationBuilder.CreateTable(
                name: "KHUYENMAI",
                columns: table => new
                {
                    MAKHUYENMAI = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MAGIAMGIA = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    MUCGIAM = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    NGAYBATDAU = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NGAYKETTHUC = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LAGIVEAWAY = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KHUYENMAI", x => x.MAKHUYENMAI);
                });

            migrationBuilder.CreateTable(
                name: "NHACUNGCAP",
                columns: table => new
                {
                    MANHACUNGCAP = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    TENNHACUNGCAP = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MOTA = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NHACUNGCAP", x => x.MANHACUNGCAP);
                });

            migrationBuilder.CreateTable(
                name: "NHANVIEN",
                columns: table => new
                {
                    MANHANVIEN = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TENDANGNHAP = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MATKHAU = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TENNV = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NGAYSINH = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GIOITINH = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    EMAIL = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SODT = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    DIACHINV = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    VAITROPHUTRACH = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ROLE = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TRANGTHAILAMVIEC = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    TRANGTHAI = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NHANVIEN", x => x.MANHANVIEN);
                });

            migrationBuilder.CreateTable(
                name: "SACH",
                columns: table => new
                {
                    MASACH = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TENSACH = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TACGIA = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    GIABAN = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SOLUONGTON = table.Column<int>(type: "int", nullable: false),
                    NOIDUNGDEMO = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    LOAISACH = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NAMXUATBAN = table.Column<int>(type: "int", nullable: true),
                    SOTRANG = table.Column<int>(type: "int", nullable: true),
                    NGONNGU = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ANHSACH = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SACH", x => x.MASACH);
                });

            migrationBuilder.CreateTable(
                name: "HOADON",
                columns: table => new
                {
                    MAHOADON = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MANHANVIEN = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    MAKHACHHANG = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MAKHUYENMAI = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    NGAYDATHANG = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NGAYGIAHANG = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DIACHIGIAOHANG = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SODIENTHOAINHAN = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    TRANGTHAIGIAOHANG = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PHIVANCHUYEN = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GIAMGIA = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TONGTIEN = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HOADON", x => x.MAHOADON);
                    table.ForeignKey(
                        name: "FK_HOADON_KHACHHANG_MAKHACHHANG",
                        column: x => x.MAKHACHHANG,
                        principalTable: "KHACHHANG",
                        principalColumn: "MAKHACHHANG",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HOADON_KHUYENMAI_MAKHUYENMAI",
                        column: x => x.MAKHUYENMAI,
                        principalTable: "KHUYENMAI",
                        principalColumn: "MAKHUYENMAI",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_HOADON_NHANVIEN_MANHANVIEN",
                        column: x => x.MANHANVIEN,
                        principalTable: "NHANVIEN",
                        principalColumn: "MANHANVIEN",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "GIOHANG",
                columns: table => new
                {
                    MAGIOHANG = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MAKHACHHANG = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    MASACH = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    SOLUONG = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GIOHANG", x => x.MAGIOHANG);
                    table.ForeignKey(
                        name: "FK_GIOHANG_KHACHHANG_MAKHACHHANG",
                        column: x => x.MAKHACHHANG,
                        principalTable: "KHACHHANG",
                        principalColumn: "MAKHACHHANG",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GIOHANG_SACH_MASACH",
                        column: x => x.MASACH,
                        principalTable: "SACH",
                        principalColumn: "MASACH",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GOM",
                columns: table => new
                {
                    MASACH = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MADANHMUC = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GOM", x => new { x.MASACH, x.MADANHMUC });
                    table.ForeignKey(
                        name: "FK_GOM_DANHMUC_MADANHMUC",
                        column: x => x.MADANHMUC,
                        principalTable: "DANHMUC",
                        principalColumn: "MADANHMUC",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GOM_SACH_MASACH",
                        column: x => x.MASACH,
                        principalTable: "SACH",
                        principalColumn: "MASACH",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CHITIETHOADON",
                columns: table => new
                {
                    MACTHD = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MAHOADON = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MASACH = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SOLUONG = table.Column<int>(type: "int", nullable: false),
                    DONGIA = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TONGTIEN = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CHITIETHOADON", x => x.MACTHD);
                    table.ForeignKey(
                        name: "FK_CHITIETHOADON_HOADON_MAHOADON",
                        column: x => x.MAHOADON,
                        principalTable: "HOADON",
                        principalColumn: "MAHOADON",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CHITIETHOADON_SACH_MASACH",
                        column: x => x.MASACH,
                        principalTable: "SACH",
                        principalColumn: "MASACH",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CHITIETHOADON_MAHOADON",
                table: "CHITIETHOADON",
                column: "MAHOADON");

            migrationBuilder.CreateIndex(
                name: "IX_CHITIETHOADON_MASACH",
                table: "CHITIETHOADON",
                column: "MASACH");

            migrationBuilder.CreateIndex(
                name: "IX_GIOHANG_MAKHACHHANG_MASACH",
                table: "GIOHANG",
                columns: new[] { "MAKHACHHANG", "MASACH" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GIOHANG_MASACH",
                table: "GIOHANG",
                column: "MASACH");

            migrationBuilder.CreateIndex(
                name: "IX_GOM_MADANHMUC",
                table: "GOM",
                column: "MADANHMUC");

            migrationBuilder.CreateIndex(
                name: "IX_HOADON_MAKHACHHANG",
                table: "HOADON",
                column: "MAKHACHHANG");

            migrationBuilder.CreateIndex(
                name: "IX_HOADON_MAKHUYENMAI",
                table: "HOADON",
                column: "MAKHUYENMAI");

            migrationBuilder.CreateIndex(
                name: "IX_HOADON_MANHANVIEN",
                table: "HOADON",
                column: "MANHANVIEN");

            migrationBuilder.CreateIndex(
                name: "IX_KHACHHANG_EMAIL",
                table: "KHACHHANG",
                column: "EMAIL",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KHACHHANG_TENDANGNHAP",
                table: "KHACHHANG",
                column: "TENDANGNHAP",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NHANVIEN_EMAIL",
                table: "NHANVIEN",
                column: "EMAIL",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NHANVIEN_TENDANGNHAP",
                table: "NHANVIEN",
                column: "TENDANGNHAP",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CHITIETHOADON");

            migrationBuilder.DropTable(
                name: "GIOHANG");

            migrationBuilder.DropTable(
                name: "GOM");

            migrationBuilder.DropTable(
                name: "NHACUNGCAP");

            migrationBuilder.DropTable(
                name: "HOADON");

            migrationBuilder.DropTable(
                name: "DANHMUC");

            migrationBuilder.DropTable(
                name: "SACH");

            migrationBuilder.DropTable(
                name: "KHACHHANG");

            migrationBuilder.DropTable(
                name: "KHUYENMAI");

            migrationBuilder.DropTable(
                name: "NHANVIEN");
        }
    }
}
