/*================================================================*/
/* 0. KIỂM TRA VÀ TẠO DATABASE (NẾU CHƯA CÓ)                      */
/*================================================================*/
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BANSACH')
BEGIN
    CREATE DATABASE BANSACH;
END
GO

USE BookStoreDB;
GO

/*================================================================*/
/* 1. DỌN DẸP BẢNG CŨ (XÓA BẢNG CON TRƯỚC, BẢNG CHA SAU)          */
/*================================================================*/
IF OBJECT_ID('CHITIETHOADON', 'U') IS NOT NULL DROP TABLE CHITIETHOADON;
IF OBJECT_ID('HOADON', 'U') IS NOT NULL DROP TABLE HOADON;
IF OBJECT_ID('GIOHANG', 'U') IS NOT NULL DROP TABLE GIOHANG;
IF OBJECT_ID('CHITIETPHIEUNHAP', 'U') IS NOT NULL DROP TABLE CHITIETPHIEUNHAP;
IF OBJECT_ID('PHIEUNHAP', 'U') IS NOT NULL DROP TABLE PHIEUNHAP;
IF OBJECT_ID('SACH_NHACUNGCAP', 'U') IS NOT NULL DROP TABLE SACH_NHACUNGCAP;
IF OBJECT_ID('GOM', 'U') IS NOT NULL DROP TABLE GOM;
IF OBJECT_ID('SACH', 'U') IS NOT NULL DROP TABLE SACH;
IF OBJECT_ID('DANHMUC', 'U') IS NOT NULL DROP TABLE DANHMUC;
IF OBJECT_ID('NHACUNGCAP', 'U') IS NOT NULL DROP TABLE NHACUNGCAP;
IF OBJECT_ID('KHUYENMAI', 'U') IS NOT NULL DROP TABLE KHUYENMAI;
IF OBJECT_ID('KHACHHANG', 'U') IS NOT NULL DROP TABLE KHACHHANG;
IF OBJECT_ID('NHANVIEN', 'U') IS NOT NULL DROP TABLE NHANVIEN;
GO

/*================================================================*/
/* 2. TẠO BẢNG CHUẨN HÓA                                          */
/*================================================================*/

-- ----- 2.1. BẢNG KHÔNG PHỤ THUỘC (BẢNG CHA) -----

CREATE TABLE DANHMUC (
    MADANHMUC   varchar(20)     NOT NULL PRIMARY KEY,
    TENDANHMUC  nvarchar(100)   NOT NULL,
    SLUG        varchar(100)    NULL,
    MOTA        nvarchar(255)   NULL,
    PARENTID    varchar(20)     NULL, 
    CONSTRAINT FK_DANHMUC_PARENT FOREIGN KEY (PARENTID) REFERENCES DANHMUC(MADANHMUC)
);
GO

-- ĐÃ BỔ SUNG: 3 cột liên hệ cho Nhà cung cấp
CREATE TABLE NHACUNGCAP (
    MANHACUNGCAP    varchar(30)     NOT NULL PRIMARY KEY,
    TENNHACUNGCAP   nvarchar(150)   NOT NULL,
    MOTA            nvarchar(255)   NULL,
    SODIENTHOAI     varchar(15)     NULL,
    EMAIL           varchar(100)    NULL,
    DIACHI          nvarchar(200)   NULL
);
GO

CREATE TABLE KHUYENMAI (
    MAKHUYENMAI     varchar(20)     NOT NULL PRIMARY KEY,
    MAGIAMGIA       varchar(20)     NULL,
    MUCGIAM         decimal(5,2)    NULL,
    NGAYBATDAU      datetime        NULL,
    NGAYKETTHUC     datetime        NULL,
    LAGIVEAWAY      bit             NOT NULL DEFAULT 0
);
GO

CREATE TABLE KHACHHANG (
    MAKHACHHANG     varchar(20)     NOT NULL PRIMARY KEY,
    TENDANGNHAP     varchar(50)     NOT NULL,
    MATKHAU         nvarchar(200)   NOT NULL,
    HOTENKH         nvarchar(100)   NULL,
    EMAIL           nvarchar(100)   NOT NULL UNIQUE,
    SODIENTHOAI     varchar(15)     NULL,
    DIACHIKH        nvarchar(200)   NULL,
    NGAYDK          datetime        NOT NULL DEFAULT GETDATE(),
    TRANGTHAI       int             NOT NULL DEFAULT 1
);
GO

CREATE TABLE NHANVIEN (
    MANHANVIEN          varchar(20)     NOT NULL PRIMARY KEY,
    TENDANGNHAP         nvarchar(50)    NOT NULL,
    MATKHAU             nvarchar(200)   NOT NULL,
    TENNV               nvarchar(100)   NULL,
    NGAYSINH            date            NULL,
    GIOITINH            nvarchar(10)    NULL,
    EMAIL               nvarchar(100)   NOT NULL UNIQUE,
    SODT                nvarchar(15)    NULL,
    DIACHINV            nvarchar(200)   NULL,
    VAITROPHUTRACH      nvarchar(30)    NOT NULL DEFAULT N'Staff',
    ROLE                nvarchar(20)    NOT NULL DEFAULT N'Staff',
    TRANGTHAILAMVIEC    nvarchar(30)    NULL,
    TRANGTHAI           int             NOT NULL DEFAULT 1
);
GO

-- ----- 2.2. BẢNG PHỤ THUỘC 1 CẤP -----

CREATE TABLE SACH (
    MASACH          varchar(20)     NOT NULL PRIMARY KEY,
    TENSACH         nvarchar(200)   NOT NULL,
    TACGIA          nvarchar(100)   NULL,
    GIABAN          decimal(18,2)   NOT NULL DEFAULT 0,
    GIAMGIA         int             NOT NULL DEFAULT 0,
    SOLUONGTON      int             NOT NULL DEFAULT 0,
    NOIDUNGDEMO     nvarchar(2000)  NULL,
    LOAISACH        nvarchar(50)    NULL,
    NAMXUATBAN      int             NULL,
    SOTRANG         int             NULL,
    NGONNGU         nvarchar(30)    NULL,
    ANHSACH         varchar(500)    NULL,
    MANHACUNGCAP    varchar(30)     NULL,
    NHACUNGCAP      nvarchar(150)   NULL,
    NGUOIDICH       nvarchar(100)   NULL,
    NHAXUATBAN      nvarchar(150)   NULL,
    TRONGLUONG      int             NULL,
    KICHTHUOC       nvarchar(50)    NULL,
    HINHTHUC        nvarchar(50)    NULL
);
GO

CREATE TABLE PHIEUNHAP (
    MAPHIEUNHAP     varchar(20)     NOT NULL PRIMARY KEY,
    MANHACUNGCAP    varchar(30)     NOT NULL,
    MANHANVIEN      varchar(20)     NOT NULL,
    NGAYNHAP        datetime        NOT NULL DEFAULT GETDATE(),
    TONGTIEN        decimal(18,2)   NOT NULL DEFAULT 0,
    CONSTRAINT FK_PN_NHACUNGCAP FOREIGN KEY (MANHACUNGCAP) REFERENCES NHACUNGCAP(MANHACUNGCAP),
    CONSTRAINT FK_PN_NHANVIEN FOREIGN KEY (MANHANVIEN) REFERENCES NHANVIEN(MANHANVIEN)
);
GO

CREATE TABLE HOADON (
    MAHOADON            varchar(20)     NOT NULL PRIMARY KEY,
    MANHANVIEN          varchar(20)     NULL,
    MAKHACHHANG         varchar(20)     NOT NULL,
    MAKHUYENMAI         varchar(20)     NULL,
    NGAYDATHANG         datetime        NOT NULL DEFAULT GETDATE(),
    NGAYGIAHANG         datetime        NULL,
    TENNGUOINHAN        nvarchar(100)   NULL,
    EMAIL               nvarchar(100)   NULL,
    PHUONGTHUCTHANHTOAN nvarchar(50)    NOT NULL DEFAULT N'COD',
    GHICHU              nvarchar(500)   NULL,
    DIACHIGIAOHANG      nvarchar(200)   NOT NULL,
    SODIENTHOAINHAN     varchar(15)     NOT NULL,
    TRANGTHAIGIAOHANG   nvarchar(30)    NOT NULL DEFAULT N'ChoXuLy',
    PHIVANCHUYEN        decimal(18,2)   NOT NULL DEFAULT 0,
    GIAMGIA             decimal(5,2)    NOT NULL DEFAULT 0,
    TONGTIEN            decimal(18,2)   NOT NULL DEFAULT 0,
    CONSTRAINT FK_HOADON_NHANVIEN FOREIGN KEY (MANHANVIEN) REFERENCES NHANVIEN(MANHANVIEN),
    CONSTRAINT FK_HOADON_KHACHHANG FOREIGN KEY (MAKHACHHANG) REFERENCES KHACHHANG(MAKHACHHANG),
    CONSTRAINT FK_HOADON_KHUYENMAI FOREIGN KEY (MAKHUYENMAI) REFERENCES KHUYENMAI(MAKHUYENMAI)
);
GO

-- ----- 2.3. BẢNG TRUNG GIAN & CHI TIẾT -----

CREATE TABLE GOM (
    MASACH      varchar(20) NOT NULL,
    MADANHMUC   varchar(20) NOT NULL,
    CONSTRAINT PK_GOM PRIMARY KEY (MASACH, MADANHMUC),
    CONSTRAINT FK_GOM_SACH FOREIGN KEY (MASACH) REFERENCES SACH(MASACH),
    CONSTRAINT FK_GOM_DANHMUC FOREIGN KEY (MADANHMUC) REFERENCES DANHMUC(MADANHMUC)
);
GO

CREATE TABLE SACH_NHACUNGCAP (
    MANHACUNGCAP    varchar(30) NOT NULL,
    MASACH          varchar(20) NOT NULL,
    CONSTRAINT PK_SACH_NHACUNGCAP PRIMARY KEY (MANHACUNGCAP, MASACH),
    CONSTRAINT FK_SNC_NHACUNGCAP FOREIGN KEY (MANHACUNGCAP) REFERENCES NHACUNGCAP(MANHACUNGCAP),
    CONSTRAINT FK_SNC_SACH FOREIGN KEY (MASACH) REFERENCES SACH(MASACH)
);
GO

CREATE TABLE CHITIETPHIEUNHAP (
    MACTPN          int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MAPHIEUNHAP     varchar(20)     NOT NULL,
    MASACH          varchar(20)     NOT NULL,
    SOLUONGNHAP     int             NOT NULL,
    GIANHAP         decimal(18,2)   NOT NULL,
    THANHTIEN       decimal(18,2)   NOT NULL,
    CONSTRAINT FK_CTPN_PHIEUNHAP FOREIGN KEY (MAPHIEUNHAP) REFERENCES PHIEUNHAP(MAPHIEUNHAP) ON DELETE CASCADE,
    CONSTRAINT FK_CTPN_SACH FOREIGN KEY (MASACH) REFERENCES SACH(MASACH)
);
GO

CREATE TABLE GIOHANG (
    MAGIOHANG       int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MAKHACHHANG     varchar(20)     NOT NULL,
    MASACH          varchar(20)     NOT NULL,
    SOLUONG         int             NOT NULL DEFAULT 1,
    CONSTRAINT UQ_GIOHANG_KH_SACH UNIQUE (MAKHACHHANG, MASACH),
    CONSTRAINT FK_GIOHANG_KHACHHANG FOREIGN KEY (MAKHACHHANG) REFERENCES KHACHHANG(MAKHACHHANG),
    CONSTRAINT FK_GIOHANG_SACH FOREIGN KEY (MASACH) REFERENCES SACH(MASACH)
);
GO

CREATE TABLE CHITIETHOADON (
    MACTHD      int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MAHOADON    varchar(20)     NOT NULL,
    MASACH      varchar(20)     NOT NULL,
    SOLUONG     int             NOT NULL,
    DONGIA      decimal(18,2)   NOT NULL,
    TONGTIEN    decimal(18,2)   NOT NULL,
    CONSTRAINT FK_CTHD_HOADON FOREIGN KEY (MAHOADON) REFERENCES HOADON(MAHOADON) ON DELETE CASCADE,
    CONSTRAINT FK_CTHD_SACH FOREIGN KEY (MASACH) REFERENCES SACH(MASACH)
);
GO

/*================================================================*/
/* 3. TẠO INDEX ĐỂ TĂNG TỐC ĐỘ TRUY VẤN                           */
/*================================================================*/
CREATE INDEX IX_SACH_TENSACH ON SACH(TENSACH);
CREATE INDEX IX_GOM_MADANHMUC ON GOM(MADANHMUC);
CREATE INDEX IX_HOADON_KHACHHANG ON HOADON(MAKHACHHANG);
CREATE INDEX IX_HOADON_TRANGTHAI ON HOADON(TRANGTHAIGIAOHANG);
CREATE INDEX IX_CTHD_MAHOADON ON CHITIETHOADON(MAHOADON);
CREATE INDEX IX_PHIEUNHAP_NGAYNHAP ON PHIEUNHAP(NGAYNHAP);
CREATE INDEX IX_CTPN_MAPHIEUNHAP ON CHITIETPHIEUNHAP(MAPHIEUNHAP);
GO

/*================================================================*/
/* 4. CHÈN DỮ LIỆU MẪU (DUMMY DATA)                               */
/*================================================================*/

-- ----- Danh mục -----
INSERT INTO DANHMUC (MADANHMUC, TENDANHMUC, SLUG, MOTA, PARENTID) VALUES
('VH', N'Văn Học', 'van-hoc', N'Nhóm sách văn học', NULL),
('KN', N'Kỹ Năng', 'ky-nang', N'Nhóm sách kỹ năng sống', NULL),
('KT', N'Kinh Tế', 'kinh-te', N'Nhóm sách kinh tế', NULL),
('TN', N'Thiếu Nhi', 'thieu-nhi', N'Nhóm sách thiếu nhi', NULL),
('NN', N'Ngoại Ngữ', 'ngoai-ngu', N'Nhóm sách ngoại ngữ', NULL);

INSERT INTO DANHMUC (MADANHMUC, TENDANHMUC, SLUG, MOTA, PARENTID) VALUES
('VH01', N'Tiểu Thuyết', 'tieu-thuyet', N'Sách tiểu thuyết các loại', 'VH'),
('VH02', N'Truyện Ngắn - Tản Văn', 'truyen-ngan', N'Sách truyện ngắn, tản văn', 'VH'),
('VH03', N'Light Novel', 'light-novel', N'Sách Light Novel', 'VH'),
('VH04', N'Ngôn Tình', 'ngon-tinh', N'Sách ngôn tình lãng mạn', 'VH'),
('KN01', N'Kỹ Năng Sống', 'ky-nang-song', N'Sách phát triển bản thân', 'KN'),
('KN02', N'Rèn Luyện Nhân Cách', 'ren-luyen', N'Rèn luyện nhân cách', 'KN'),
('KN03', N'Tâm Lý', 'tam-ly', N'Sách tâm lý học ứng dụng', 'KN'),
('KN04', N'Sách Cho Tuổi Mới Lớn', 'tuoi-moi-lon', N'Dành cho tuổi dậy thì', 'KN'),
('KT01', N'Nhân Vật - Bài Học Kinh Doanh', 'nhan-vat', N'Bài học kinh doanh', 'KT'),
('KT02', N'Quản Trị - Lãnh Đạo', 'quan-tri', N'Sách quản trị nhân sự', 'KT'),
('KT03', N'Marketing - Bán Hàng', 'marketing', N'Marketing và bán hàng', 'KT'),
('KT04', N'Phân Tích Kinh Tế', 'phan-tich', N'Kinh tế học vi mô, vĩ mô', 'KT'),
('TN01', N'Manga - Comic', 'manga', N'Truyện tranh Manga', 'TN'),
('TN02', N'Kiến Thức Bách Khoa', 'kien-thuc', N'Kiến thức khoa học cho bé', 'TN'),
('TN03', N'Sách Tranh Kỹ Năng Sống', 'sach-tranh', N'Sách tranh giáo dục', 'TN'),
('TN04', N'Vừa Học - Vừa Chơi', 'vua-hoc', N'Sách tương tác', 'TN'),
('NN01', N'Tiếng Anh', 'tieng-anh', N'Tài liệu tiếng Anh', 'NN'),
('NN02', N'Tiếng Nhật', 'tieng-nhat', N'Tài liệu tiếng Nhật', 'NN'),
('NN03', N'Tiếng Hoa', 'tieng-hoa', N'Tài liệu tiếng Trung Quốc', 'NN'),
('NN04', N'Tiếng Hàn', 'tieng-han', N'Tài liệu tiếng Hàn Quốc', 'NN');
GO

-- ĐÃ BỔ SUNG: Dữ liệu liên hệ mẫu cho Nhà cung cấp
INSERT INTO NHACUNGCAP (MANHACUNGCAP, TENNHACUNGCAP, MOTA, SODIENTHOAI, EMAIL, DIACHI) VALUES
('NCC01', N'Công ty CP Sách First News', N'Chuyên phát hành sách văn học và kỹ năng sống', '02838227979', 'info@firstnews.com.vn', N'11H Nguyễn Thị Minh Khai, Q1, TP.HCM'),
('NCC02', N'NXB Kim Đồng', N'Nhà xuất bản đầu sách thiếu nhi, manga trong nước', '1900571595', 'cskh@nxbkimdong.com.vn', N'55 Quang Trung, Hai Bà Trưng, Hà Nội'),
('NCC03', N'NXB Trẻ', N'Chuyên sách kinh tế, văn học', '02839316289', 'hopthu@nxbtre.com.vn', N'161B Lý Chính Thắng, Q3, TP.HCM');
GO

-- ----- Sách -----
INSERT INTO SACH (MASACH, TENSACH, TACGIA, GIABAN, GIAMGIA, SOLUONGTON, NOIDUNGDEMO, LOAISACH, NAMXUATBAN, SOTRANG, NGONNGU, ANHSACH, MANHACUNGCAP, NHAXUATBAN) VALUES
('S001', N'Nhà Giả Kim', N'Paulo Coelho', 79000, 10, 10, N'Hành trình đi tìm kho báu và ý nghĩa cuộc sống.', N'Văn học', 1988, 228, N'Tiếng Việt', '\Image\VANHOC\TIEUTHUYET\NHAGIAKIM.webp', 'NCC01', N'NXB Hội Nhà Văn'),
('S002', N'Chung Một Mái Nhà ', N'Reki Kawahara', 85000, 0, 20, N'Trận chiến sinh tồn trong thế giới ảo.', N'Văn học', 2009, 250, N'Tiếng Việt', '\Image\VANHOC\LightNovel\CHUNGMOTMAINHA.webp', 'NCC03', N'IPM'),
('S003', N'Bến Xe', N'Cố Mạn', 65000, 10, 4, N'Câu chuyện tình yêu đầy lãng mạn.', N'Văn học', 2010, 300, N'Tiếng Việt', '\Image\VANHOC\NGONTINH\BENXE.webp', 'NCC01', N'NXB Văn Học'),
('S004', N'Con Đường Chẳng Mấy Ai Đi ', N'Dale Carnegie', 86000, 10, 15, N'Nghệ thuật đối nhân xử thế kinh điển mọi thời đại.', N'Kỹ năng', 1936, 320, N'Tiếng Việt', '\Image\KYNANG\KYNANGSONG\CONDUONGCHANGMAYAIDI.webp', 'NCC01', N'First News'),
('S005', N'Cách Để Trở Thành Cha Mẹ Tốt', N'Rosie Nguyễn', 72000, 0, 20, N'Cuốn sách truyền cảm hứng dành cho người trẻ Việt Nam.', N'Kỹ năng', 2016, 250, N'Tiếng Việt','\Image\KYNANG\SACHCHOTUOIMOILON\CACHDETROTHANHCHAMETOT.webp', 'NCC03', N'Nhã Nam'),
('S006', N'Kinh Tế Việt Nam', N'Robert Kiyosaki', 95000, 10, 30, N'Nền tảng tư duy tài chính thay đổi cuộc đời.', N'Kinh tế', 1997, 336, N'Tiếng Việt', '\Image\KINHTE\PHANTICHKINHTE\KINHTEVIETNAM.webp', 'NCC03', N'NXB Trẻ'),
('S007', N'Giải Trí Đến Chết', N'Philip Kotler', 119000, 0, 10, N'Xu hướng marketing trong kỷ nguyên số.', N'Kinh tế', 2017, 280, N'Tiếng Việt', '\Image\KINHTE\Marketing_BANHANG\GIAITRIDENCHET.webp', 'NCC03', N'NXB Trẻ'),
('S008', N'AI Roadmap', N'Walter Isaacson', 199000, 0, 3, N'Tiểu sử về vị CEO huyền thoại của Apple.', N'Kinh tế', 2011, 650, N'Tiếng Việt', '\Image\KINHTE\QUANTRI_LANHDAO\AI Roadmap.webp', 'NCC01', N'Alpha Books'),
('S009', N'Dan Dan Dan ', N'Fujiko F. Fujio', 25000, 10, 50, N'Bộ truyện tranh thiếu nhi kinh điển của Nhật Bản.', N'Thiếu nhi', 1969, 190, N'Tiếng Việt', '\Image\THIEUNHI\MagaComic\DAN DA DAN.webp', 'NCC02', N'NXB Kim Đồng'),
('S010', N'Thám Tử Lừng Danh Conan', N'Gosho Aoyama', 25000, 0, 30, N'Truyện tranh trinh thám.', N'Thiếu nhi', 1994, 200, N'Tiếng Việt', '\Image\THIEUNHI\MagaComic\THAMTULUONGDANHCONAN.webp', 'NCC02', N'NXB Kim Đồng'),
('S011', N'Mao', N'Eiichiro Oda', 25000, 0, 20, N'Truyện tranh phiêu lưu hài hước.', N'Thiếu nhi', 1997, 200, N'Tiếng Việt', '\Image\THIEUNHI\MagaComic\MAO.webp', 'NCC02', N'NXB Kim Đồng');

GO

-- ----- Gán sách vào danh mục -----
INSERT INTO GOM (MASACH, MADANHMUC) VALUES
('S001','VH01'), ('S002','VH03'), ('S003','VH04'), ('S004','KN01'), ('S005','KN04'), 
('S006','KT04'), ('S007','KT03'), ('S008','KT01'), ('S009','TN01'), ('S010','TN01'), ('S011','TN01');
GO

-- ----- Tài khoản mẫu -----
INSERT INTO NHANVIEN (MANHANVIEN, TENDANGNHAP, MATKHAU, TENNV, EMAIL, VAITROPHUTRACH, ROLE, TRANGTHAILAMVIEC, TRANGTHAI) VALUES
('NV001', 'admin', '$2b$11$QLj8z3b7h5FS9dVcdyVYj.DkW0MmndWveQVkx8X5i19/idvI.dQcy', N'Quản Trị Viên', 'nm358338@gmail.com', N'Quản trị hệ thống', 'Admin', N'DangLamViec', 1),
('NV002', 'staff', '$2a$11$o2EZrqlCD9DvCoV8lsJhQOki5d5b3.FMxOttZ.ARWrmR1zO1iDj7i', N'Nhân Viên Bán Hàng', 'staff@bookstore.com', N'Bán hàng', 'Staff', N'DangLamViec', 1);
GO

INSERT INTO KHACHHANG (MAKHACHHANG, TENDANGNHAP, MATKHAU, HOTENKH, EMAIL, SODIENTHOAI, DIACHIKH, TRANGTHAI) VALUES
('KH001', 'test@bookstore.com', '$2b$11$UsejvSVoRrxrXybpz6EviuriVOtmqedJnvGGSY5gT9mUWMaUcuof6', N'Người Dùng Test', 'test@bookstore.com', '0900000000', N'123 Đường ABC, Quận 1, TP.HCM', 1);
GO

-- ----- Dữ liệu mẫu Phiếu Nhập ban đầu -----
INSERT INTO PHIEUNHAP (MAPHIEUNHAP, MANHACUNGCAP, MANHANVIEN, NGAYNHAP, TONGTIEN) VALUES
('PN001', 'NCC02', 'NV001', GETDATE(), (50*15000 + 30*16000 + 20*15000));
GO

INSERT INTO CHITIETPHIEUNHAP (MAPHIEUNHAP, MASACH, SOLUONGNHAP, GIANHAP, THANHTIEN) VALUES
('PN001', 'S009', 50, 15000, 50 * 15000),
('PN001', 'S010', 30, 16000, 30 * 16000),
('PN001', 'S011', 20, 15000, 20 * 15000);
GO

/*================================================================*/
/* 5. KIỂM TRA DỮ LIỆU SAU KHI TẠO                                */
/*================================================================*/
SELECT * FROM NHACUNGCAP;
SELECT * FROM PHIEUNHAP;
SELECT * FROM CHITIETPHIEUNHAP;
SELECT * FROM HOADON;
SELECT * FROM SACH;
SELECT * FROM NHANVIEN;

/*
DROP TABLE IF EXISTS [__EFMigrationsHistory];
DROP TABLE IF EXISTS [ActivityLogs];

-- 1. Chuyển context sang master để giải phóng database BANSACH
USE master;
GO

-- 2. Ngắt kết nối các tiến trình khác đang dùng BANSACH và xóa database
ALTER DATABASE [BANSACH] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE [BANSACH];
GO

-- 3. Tạo lại database trống mới tinh
CREATE DATABASE [BANSACH];
GO*/

/* BẢNG MIGRATIONS*/
/*CREATE TABLE [ActivityLogs] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(max) NOT NULL,
    [Action] nvarchar(max) NOT NULL,
    [EntityType] nvarchar(max) NOT NULL,
    [Details] nvarchar(max) NULL,
    [Timestamp] datetime2 NOT NULL,
    CONSTRAINT [PK_ActivityLogs] PRIMARY KEY ([Id])
);
GO*/


-- Cập nhật tài khoản của bạn thành quyền Admin
UPDATE NHANVIEN 
SET ROLE = 'Admin', VAITROPHUTRACH = N'Quản trị hệ thống' 
WHERE EMAIL = 'minhcang29.4@gmail.com';