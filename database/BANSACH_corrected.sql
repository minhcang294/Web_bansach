/*================================================================*/
/* 0. KIỂM TRA VÀ TẠO DATABASE (NẾU CHƯA CÓ)                      */
/*================================================================*/
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BANSACH')
BEGIN
    CREATE DATABASE BANSACH;
END
GO

USE BANSACH;
GO

/*================================================================*/
/* 1. DỌN DẸP BẢNG CŨ (XÓA BẢNG CON TRƯỚC, BẢNG CHA SAU)          */
/*================================================================*/
IF OBJECT_ID('CHITIETHOADON', 'U') IS NOT NULL DROP TABLE CHITIETHOADON;
IF OBJECT_ID('GIOHANG', 'U') IS NOT NULL DROP TABLE GIOHANG;
IF OBJECT_ID('HOADON', 'U') IS NOT NULL DROP TABLE HOADON;
IF OBJECT_ID('GOM', 'U') IS NOT NULL DROP TABLE GOM;
IF OBJECT_ID('SACH_NHACUNGCAP', 'U') IS NOT NULL DROP TABLE SACH_NHACUNGCAP;
IF OBJECT_ID('SACH', 'U') IS NOT NULL DROP TABLE SACH;
IF OBJECT_ID('DANHMUC', 'U') IS NOT NULL DROP TABLE DANHMUC;
IF OBJECT_ID('NHACUNGCAP', 'U') IS NOT NULL DROP TABLE NHACUNGCAP;
IF OBJECT_ID('KHUYENMAI', 'U') IS NOT NULL DROP TABLE KHUYENMAI;
IF OBJECT_ID('KHACHHANG', 'U') IS NOT NULL DROP TABLE KHACHHANG;
IF OBJECT_ID('NHANVIEN', 'U') IS NOT NULL DROP TABLE NHANVIEN;
GO

/*================================================================*/
/* 2. TẠO BẢNG                                                    */
/*================================================================*/

-- ----- DANHMUC: Danh mục sách -----
CREATE TABLE DANHMUC (
    MADANHMUC   varchar(20)     NOT NULL PRIMARY KEY,
    TENDANHMUC  nvarchar(100)   NOT NULL,
    MOTA        nvarchar(255)   NULL
);
GO

-- ----- SACH: Thông tin sách -----
CREATE TABLE SACH (
    MASACH        varchar(20)     NOT NULL PRIMARY KEY,
    TENSACH       nvarchar(200)   NOT NULL,
    TACGIA        nvarchar(100)   NULL,
    GIABAN        decimal(18,2)   NOT NULL DEFAULT 0,
    SOLUONGTON    int             NOT NULL DEFAULT 0,
    NOIDUNGDEMO   nvarchar(2000)  NULL,
    LOAISACH      nvarchar(50)    NULL,
    NAMXUATBAN    int             NULL,
    SOTRANG       int             NULL,
    NGONNGU       nvarchar(30)    NULL,
    ANHSACH       varchar(500)    NULL
);
GO

-- ----- GOM: Quan hệ n-n Sách <-> Danh mục -----
CREATE TABLE GOM (
    MASACH      varchar(20) NOT NULL,
    MADANHMUC   varchar(20) NOT NULL,
    CONSTRAINT PK_GOM PRIMARY KEY (MASACH, MADANHMUC),
    CONSTRAINT FK_GOM_SACH FOREIGN KEY (MASACH) REFERENCES SACH(MASACH),
    CONSTRAINT FK_GOM_DANHMUC FOREIGN KEY (MADANHMUC) REFERENCES DANHMUC(MADANHMUC)
);
GO

-- ----- NHACUNGCAP: Nhà cung cấp -----
CREATE TABLE NHACUNGCAP (
    MANHACUNGCAP    varchar(30)     NOT NULL PRIMARY KEY,
    TENNHACUNGCAP   nvarchar(150)   NOT NULL,
    MOTA            nvarchar(255)   NULL
);
GO

-- ----- SACH_NHACUNGCAP: Quan hệ n-n Sách <-> Nhà cung cấp -----
CREATE TABLE SACH_NHACUNGCAP (
    MANHACUNGCAP    varchar(30) NOT NULL,
    MASACH          varchar(20) NOT NULL,
    CONSTRAINT PK_SACH_NHACUNGCAP PRIMARY KEY (MANHACUNGCAP, MASACH),
    CONSTRAINT FK_SNC_NHACUNGCAP FOREIGN KEY (MANHACUNGCAP) REFERENCES NHACUNGCAP(MANHACUNGCAP),
    CONSTRAINT FK_SNC_SACH FOREIGN KEY (MASACH) REFERENCES SACH(MASACH)
);
GO

-- ----- KHACHHANG: Tài khoản khách hàng -----
CREATE TABLE KHACHHANG (
    MAKHACHHANG   varchar(20)     NOT NULL PRIMARY KEY,
    TENDANGNHAP   varchar(50)     NOT NULL,
    MATKHAU       nvarchar(200)   NOT NULL,   -- BCrypt hash
    HOTENKH       nvarchar(100)   NULL,
    EMAIL         nvarchar(100)   NOT NULL UNIQUE,
    SODIENTHOAI   varchar(15)     NULL,
    DIACHIKH      nvarchar(200)   NULL,
    NGAYDK        datetime        NOT NULL DEFAULT GETDATE(),
    TRANGTHAI     int             NOT NULL DEFAULT 1   -- 1 = hoạt động, 0 = khóa
);
GO

-- ----- NHANVIEN: Tài khoản nhân viên/admin -----
CREATE TABLE NHANVIEN (
    MANHANVIEN         varchar(20)     NOT NULL PRIMARY KEY,
    TENDANGNHAP        nvarchar(50)    NOT NULL,
    MATKHAU            nvarchar(200)   NOT NULL,   -- BCrypt hash
    TENNV              nvarchar(100)   NULL,
    NGAYSINH           date            NULL,
    GIOITINH           nvarchar(10)    NULL,
    EMAIL              nvarchar(100)   NOT NULL UNIQUE,
    SODT               nvarchar(15)    NULL,
    DIACHINV           nvarchar(200)   NULL,
    VAITROPHUTRACH     nvarchar(30)    NOT NULL DEFAULT N'Staff',
    ROLE               nvarchar(20)    NOT NULL DEFAULT N'Staff', -- 'Admin' | 'Staff'
    TRANGTHAILAMVIEC   nvarchar(30)    NULL,
    TRANGTHAI          int             NOT NULL DEFAULT 1
);
GO

-- ----- KHUYENMAI: Mã giảm giá / chương trình khuyến mãi -----
CREATE TABLE KHUYENMAI (
    MAKHUYENMAI   varchar(20)     NOT NULL PRIMARY KEY,
    MAGIAMGIA     varchar(20)     NULL,
    MUCGIAM       decimal(5,2)    NULL,     -- % giảm giá
    NGAYBATDAU    datetime        NULL,
    NGAYKETTHUC   datetime        NULL,
    LAGIVEAWAY    bit             NOT NULL DEFAULT 0
);
GO

-- ----- GIOHANG: Giỏ hàng của khách -----
CREATE TABLE GIOHANG (
    MAGIOHANG     int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MAKHACHHANG   varchar(20)     NOT NULL,
    MASACH        varchar(20)     NOT NULL,
    SOLUONG       int             NOT NULL DEFAULT 1,
    CONSTRAINT UQ_GIOHANG_KH_SACH UNIQUE (MAKHACHHANG, MASACH),
    CONSTRAINT FK_GIOHANG_KHACHHANG FOREIGN KEY (MAKHACHHANG) REFERENCES KHACHHANG(MAKHACHHANG),
    CONSTRAINT FK_GIOHANG_SACH FOREIGN KEY (MASACH) REFERENCES SACH(MASACH)
);
GO

-- ----- HOADON: Đơn hàng -----
CREATE TABLE HOADON (
    MAHOADON            varchar(20)     NOT NULL PRIMARY KEY,
    MANHANVIEN          varchar(20)     NULL,        -- NULL = đơn online chưa có NV xử lý
    MAKHACHHANG         varchar(20)     NOT NULL,
    MAKHUYENMAI         varchar(20)     NULL,        -- NULL = không dùng khuyến mãi
    NGAYDATHANG         datetime        NOT NULL DEFAULT GETDATE(),
    NGAYGIAHANG         datetime        NULL,
    DIACHIGIAOHANG      nvarchar(200)   NOT NULL,
    SODIENTHOAINHAN     varchar(15)     NOT NULL,
    TRANGTHAIGIAOHANG   nvarchar(30)    NOT NULL DEFAULT N'ChoXuLy',  -- ChoXuLy|DaXacNhan|DangGiao|HoanTat|DaHuy
    PHIVANCHUYEN        decimal(18,2)   NOT NULL DEFAULT 0,
    GIAMGIA             decimal(5,2)    NOT NULL DEFAULT 0,
    TONGTIEN            decimal(18,2)   NOT NULL DEFAULT 0,
    CONSTRAINT FK_HOADON_NHANVIEN FOREIGN KEY (MANHANVIEN) REFERENCES NHANVIEN(MANHANVIEN),
    CONSTRAINT FK_HOADON_KHACHHANG FOREIGN KEY (MAKHACHHANG) REFERENCES KHACHHANG(MAKHACHHANG),
    CONSTRAINT FK_HOADON_KHUYENMAI FOREIGN KEY (MAKHUYENMAI) REFERENCES KHUYENMAI(MAKHUYENMAI)
);
GO

-- ----- CHITIETHOADON: Chi tiết từng sản phẩm trong đơn hàng -----
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
/* 3. INDEX CHO CÁC CỘT TÌM KIẾM/LỌC                              */
/*================================================================*/
CREATE INDEX IX_SACH_TENSACH ON SACH(TENSACH);
CREATE INDEX IX_GOM_MADANHMUC ON GOM(MADANHMUC);
CREATE INDEX IX_HOADON_KHACHHANG ON HOADON(MAKHACHHANG);
CREATE INDEX IX_HOADON_TRANGTHAI ON HOADON(TRANGTHAIGIAOHANG);
CREATE INDEX IX_CTHD_MAHOADON ON CHITIETHOADON(MAHOADON);
GO

/*================================================================*/
/* 4. DỮ LIỆU MẪU                                                 */
/*================================================================*/

-- ----- 4.1 Danh mục -----
INSERT INTO DANHMUC (MADANHMUC, TENDANHMUC, MOTA) VALUES
('DM01', N'Văn học', N'Tiểu thuyết, truyện ngắn trong và ngoài nước'),
('DM02', N'Kỹ năng sống', N'Sách phát triển bản thân, tư duy'),
('DM03', N'Kinh tế', N'Sách kinh doanh, tài chính, quản trị'),
('DM04', N'Thiếu nhi', N'Sách dành cho trẻ em, truyện tranh'),
('DM05', N'Ngoại ngữ', N'Sách học tiếng Anh và các ngoại ngữ khác');
GO

-- ----- 4.2 Sách -----
INSERT INTO SACH (MASACH, TENSACH, TACGIA, GIABAN, SOLUONGTON, NOIDUNGDEMO, LOAISACH, NAMXUATBAN, SOTRANG, NGONNGU, ANHSACH) VALUES
('S001', N'Nhà Giả Kim', N'Paulo Coelho', 79000, 50, N'Hành trình đi tìm kho báu và ý nghĩa cuộc sống.', N'Văn học', 1988, 228, N'Tiếng Việt', 'https://placehold.co/300x420/D91C24/FFF?text=Nha+Gia+Kim'),
('S002', N'Nhà Khuyến Học', N'Fukuzawa Yukichi', 68000, 35, N'Tác phẩm kinh điển về tinh thần tự học.', N'Văn học', 1872, 220, N'Tiếng Việt', 'https://placehold.co/300x420/D91C24/FFF?text=Nha+Khuyen+Hoc'),
('S003', N'Hoàng Tử Bé', N'Antoine de Saint-Exupéry', 65000, 60, N'Câu chuyện cổ tích dành cho người lớn.', N'Văn học', 1943, 96, N'Tiếng Việt', 'https://placehold.co/300x420/E53935/FFF?text=Hoang+Tu+Be'),
('S004', N'Đắc Nhân Tâm', N'Dale Carnegie', 86000, 40, N'Nghệ thuật đối nhân xử thế kinh điển mọi thời đại.', N'Kỹ năng sống', 1936, 320, N'Tiếng Việt', 'https://placehold.co/300x420/8A1015/FFF?text=Dac+Nhan+Tam'),
('S005', N'Tuổi Trẻ Đáng Giá Bao Nhiêu', N'Rosie Nguyễn', 72000, 45, N'Cuốn sách truyền cảm hứng dành cho người trẻ Việt Nam.', N'Kỹ năng sống', 2016, 250, N'Tiếng Việt', 'https://placehold.co/300x420/8A1015/FFF?text=Tuoi+Tre'),
('S006', N'Cha Giàu Cha Nghèo', N'Robert Kiyosaki', 95000, 30, N'Nền tảng tư duy tài chính thay đổi cuộc đời.', N'Kinh tế', 1997, 336, N'Tiếng Việt', 'https://placehold.co/300x420/B71C1C/FFF?text=Cha+Giau+Cha+Ngheo'),
('S007', N'Nhà Kinh Tế Học Tự Nhiên', N'Robert H. Frank', 89000, 20, N'Ứng dụng tư duy kinh tế học vào đời sống.', N'Kinh tế', 2007, 280, N'Tiếng Việt', 'https://placehold.co/300x420/B71C1C/FFF?text=Kinh+Te+Hoc'),
('S008', N'Nghĩ Giàu Làm Giàu', N'Napoleon Hill', 99000, 25, N'Bí quyết thành công được đúc kết từ hàng trăm triệu phú.', N'Kinh tế', 1937, 320, N'Tiếng Việt', 'https://placehold.co/300x420/B71C1C/FFF?text=Nghi+Giau+Lam+Giau'),
('S009', N'Doraemon - Tập 1', N'Fujiko F. Fujio', 25000, 100, N'Bộ truyện tranh thiếu nhi kinh điển của Nhật Bản.', N'Thiếu nhi', 1969, 190, N'Tiếng Việt', 'https://placehold.co/300x420/F44336/FFF?text=Doraemon'),
('S010', N'Totto-chan Bên Cửa Sổ', N'Kuroyanagi Tetsuko', 78000, 55, N'Câu chuyện tuổi thơ đầy cảm hứng.', N'Thiếu nhi', 1981, 264, N'Tiếng Việt', 'https://placehold.co/300x420/F44336/FFF?text=Totto-chan'),
('S011', N'Cổ Tích Việt Nam Cho Bé - Tấm Cám', N'Sưu tầm', 18000, 80, N'Truyện cổ tích quen thuộc dành cho các bé.', N'Thiếu nhi', 2022, 24, N'Tiếng Việt', 'https://placehold.co/300x420/F44336/FFF?text=Tam+Cam'),
('S012', N'English Grammar in Use', N'Raymond Murphy', 145000, 25, N'Sách ngữ pháp tiếng Anh phổ biến nhất thế giới.', N'Ngoại ngữ', 2019, 380, N'Tiếng Anh', 'https://placehold.co/300x420/6A0F13/FFF?text=Grammar+in+Use'),
('S013', N'IELTS Cambridge 18', N'Cambridge University Press', 210000, 18, N'Bộ đề luyện thi IELTS chính thức từ Cambridge.', N'Ngoại ngữ', 2023, 160, N'Tiếng Anh', 'https://placehold.co/300x420/6A0F13/FFF?text=IELTS+18'),
('S014', N'Từ Điển Anh - Việt', N'Viện Ngôn Ngữ Học', 120000, 2, N'Từ điển song ngữ phổ thông dùng cho học sinh, sinh viên.', N'Ngoại ngữ', 2020, 900, N'Song ngữ', 'https://placehold.co/300x420/6A0F13/FFF?text=Tu+Dien'),
('S015', N'Hán Tự Thông Dụng', N'Nguyễn Văn A', 95000, 4, N'Sách học chữ Hán cơ bản cho người mới bắt đầu.', N'Ngoại ngữ', 2021, 240, N'Tiếng Trung', 'https://placehold.co/300x420/6A0F13/FFF?text=Han+Tu');
GO

-- ----- 4.3 Gán sách vào danh mục -----
INSERT INTO GOM (MASACH, MADANHMUC) VALUES
('S001','DM01'),('S002','DM01'),('S003','DM01'),
('S004','DM02'),('S005','DM02'),
('S006','DM03'),('S007','DM03'),('S008','DM03'),
('S009','DM04'),('S010','DM04'),('S011','DM04'),
('S012','DM05'),('S013','DM05'),('S014','DM05'),('S015','DM05');
GO

-- ----- 4.4 Nhà cung cấp -----
INSERT INTO NHACUNGCAP (MANHACUNGCAP, TENNHACUNGCAP, MOTA) VALUES
('NCC01', N'Công ty CP Sách First News', N'Chuyên phát hành sách văn học và kỹ năng sống'),
('NCC02', N'NXB Trẻ', N'Nhà xuất bản đầu sách thiếu nhi, văn học trong nước'),
('NCC03', N'Công ty TNHH Sách Ngoại Văn', N'Chuyên nhập khẩu sách ngoại ngữ, tài liệu luyện thi quốc tế');
GO

INSERT INTO SACH_NHACUNGCAP (MANHACUNGCAP, MASACH) VALUES
('NCC01','S001'),('NCC01','S004'),('NCC01','S005'),('NCC01','S006'),('NCC01','S007'),('NCC01','S008'),
('NCC02','S002'),('NCC02','S003'),('NCC02','S009'),('NCC02','S010'),('NCC02','S011'),
('NCC03','S012'),('NCC03','S013'),('NCC03','S014'),('NCC03','S015');
GO

-- ----- 4.5 Khuyến mãi -----
INSERT INTO KHUYENMAI (MAKHUYENMAI, MAGIAMGIA, MUCGIAM, NGAYBATDAU, NGAYKETTHUC, LAGIVEAWAY) VALUES
('KM01', 'SUMMER10', 10.00, '2026-06-01', '2026-08-31', 0),
('KM02', 'NEWMEMBER', 15.00, '2026-01-01', '2026-12-31', 0),
('KM03', 'FREESHIP', 0.00, '2026-07-01', '2026-07-31', 1);
GO

-- ----- 4.6 Tài khoản mẫu -----
-- Mật khẩu tương ứng: admin123 (Admin), staff123 (Nhân viên), 123456 (Khách hàng)
INSERT INTO NHANVIEN (MANHANVIEN, TENDANGNHAP, MATKHAU, TENNV, EMAIL, VAITROPHUTRACH, ROLE, TRANGTHAILAMVIEC, TRANGTHAI) VALUES
('NV001', 'admin', '$2b$11$QLj8z3b7h5FS9dVcdyVYj.DkW0MmndWveQVkx8X5i19/idvI.dQcy', N'Quản Trị Viên', 'admin@bookstore.com', N'Quản trị hệ thống', 'Admin', N'DangLamViec', 1),
('NV002', 'staff',  '$2b$11$qAEtkm3hYggYIZNhv26Jyu9qzcOUTKtQ31JQ.BnDCI62vqK3ZBrYC', N'Nhân Viên Bán Hàng', 'staff@bookstore.com', N'Xử lý đơn hàng', 'Staff', N'DangLamViec', 1);
GO

INSERT INTO KHACHHANG (MAKHACHHANG, TENDANGNHAP, MATKHAU, HOTENKH, EMAIL, SODIENTHOAI, DIACHIKH, TRANGTHAI) VALUES
('KH001', 'test@bookstore.com', '$2b$11$UsejvSVoRrxrXybpz6EviuriVOtmqedJnvGGSY5gT9mUWMaUcuof6', N'Người Dùng Test', 'test@bookstore.com', '0900000000', N'123 Đường ABC, Quận 1, TP.HCM', 1);
GO

-- ----- 4.7 Đơn hàng mẫu -----
INSERT INTO HOADON (MAHOADON, MANHANVIEN, MAKHACHHANG, MAKHUYENMAI, NGAYDATHANG, NGAYGIAHANG, DIACHIGIAOHANG, SODIENTHOAINHAN, TRANGTHAIGIAOHANG, PHIVANCHUYEN, GIAMGIA, TONGTIEN) VALUES
('HD0000001', 'NV002', 'KH001', NULL, '2026-07-01 09:00:00', '2026-07-03 15:00:00', N'123 Đường ABC, Quận 1, TP.HCM', '0900000000', N'HoanTat', 0, 0, 144000);
GO

INSERT INTO CHITIETHOADON (MAHOADON, MASACH, SOLUONG, DONGIA, TONGTIEN) VALUES
('HD0000001', 'S001', 1, 79000, 79000),
('HD0000001', 'S009', 1, 25000, 25000),
('HD0000001', 'S011', 1, 18000, 18000);
GO

/*================================================================*/
/* 5. KIỂM TRA NHANH                                              */
/*================================================================*/
SELECT 'DANHMUC' AS Bảng, COUNT(*) AS SoLuong FROM DANHMUC;
SELECT 'SACH' AS Bảng, COUNT(*) AS SoLuong FROM SACH;
SELECT 'NHANVIEN' AS Bảng, COUNT(*) AS SoLuong FROM NHANVIEN;
SELECT 'KHACHHANG' AS Bảng, COUNT(*) AS SoLuong FROM KHACHHANG;
SELECT 'HOADON' AS Bảng, COUNT(*) AS SoLuong FROM HOADON;
SELECT * FROM HOADON;
SELECT * FROM SACH;
GO