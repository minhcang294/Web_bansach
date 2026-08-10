/*==============================================================*/
/* BANSACH_corrected.sql                                        */
/* Đã sửa: kiểu dữ liệu SOLUONG/DONGIA/TONGTIEN, MAKHUYENMAI     */
/* cho phép null, mở rộng MATKHAU cho mật khẩu đã hash,          */
/* NGAYSINH -> date, và THÊM bảng GIOHANG (giỏ hàng)             */
/*==============================================================*/
USE BANSACH;
GO
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

/*==============================================================*/
/* Table: SACH (Sách)                                           */
/*==============================================================*/
CREATE TABLE SACH (
   MASACH        varchar(20)     NOT NULL,
   TENSACH       nvarchar(200)   NOT NULL,
   TACGIA        nvarchar(100)   NULL,
   GIABAN        decimal(18,2)   NOT NULL DEFAULT 0,
   SOLUONGTON    int             NOT NULL DEFAULT 0,
   NOIDUNGDEMO   nvarchar(2000)  NULL,
   LOAISACH      nvarchar(50)    NULL,
   NAMXUATBAN    int             NULL,
   SOTRANG       int             NULL,
   NGONNGU       nvarchar(30)    NULL,
   ANHSACH       varchar(500)    NULL,
   CONSTRAINT PK_SACH PRIMARY KEY (MASACH)
);
GO

/*==============================================================*/
/* Table: DANHMUC (Danh mục)                                    */
/*==============================================================*/
CREATE TABLE DANHMUC (
   MADANHMUC   varchar(20)    NOT NULL,
   TENDANHMUC  nvarchar(100)  NOT NULL,
   MOTA        nvarchar(255)  NULL,
   CONSTRAINT PK_DANHMUC PRIMARY KEY (MADANHMUC)
);
GO

/*==============================================================*/
/* Table: GOM (Sách - Danh mục, n-n)                             */
/*==============================================================*/
CREATE TABLE GOM (
   MASACH     varchar(20) NOT NULL,
   MADANHMUC  varchar(20) NOT NULL,
   CONSTRAINT PK_GOM PRIMARY KEY (MASACH, MADANHMUC),
   CONSTRAINT FK_GOM_SACH FOREIGN KEY (MASACH) REFERENCES SACH (MASACH),
   CONSTRAINT FK_GOM_DANHMUC FOREIGN KEY (MADANHMUC) REFERENCES DANHMUC (MADANHMUC)
);
GO

/*==============================================================*/
/* Table: NHACUNGCAP (Nhà cung cấp)                              */
/*==============================================================*/
CREATE TABLE NHACUNGCAP (
   MANHACUNGCAP   varchar(30)    NOT NULL,
   TENNHACUNGCAP  nvarchar(150)  NOT NULL,
   MOTA           nvarchar(255)  NULL,
   CONSTRAINT PK_NHACUNGCAP PRIMARY KEY (MANHACUNGCAP)
);
GO

/*==============================================================*/
/* Table: SACH_NHACUNGCAP (đổi tên từ ASSOCIATION_10 cho rõ nghĩa)*/
/*==============================================================*/
CREATE TABLE SACH_NHACUNGCAP (
   MANHACUNGCAP  varchar(30) NOT NULL,
   MASACH        varchar(20) NOT NULL,
   CONSTRAINT PK_SACH_NHACUNGCAP PRIMARY KEY (MANHACUNGCAP, MASACH),
   CONSTRAINT FK_SNC_NHACUNGCAP FOREIGN KEY (MANHACUNGCAP) REFERENCES NHACUNGCAP (MANHACUNGCAP),
   CONSTRAINT FK_SNC_SACH FOREIGN KEY (MASACH) REFERENCES SACH (MASACH)
);
GO

/*==============================================================*/
/* Table: KHACHHANG (Khách hàng)                                 */
/*==============================================================*/
CREATE TABLE KHACHHANG (
   MAKHACHHANG   varchar(20)    NOT NULL,   -- đã sửa: bỏ chữ G thừa (MAKHACHHANGG -> MAKHACHHANG)
   TENDANGNHAP   varchar(50)    NOT NULL,
   MATKHAU       nvarchar(200)  NOT NULL,   -- mở rộng để chứa mật khẩu đã BCrypt hash
   HOTENKH       nvarchar(100)  NULL,
   EMAIL         nvarchar(100)  NOT NULL,
   SODIENTHOAI   varchar(15)    NULL,
   DIACHIKH      nvarchar(200)  NULL,
   NGAYDK        datetime       NOT NULL DEFAULT GETDATE(),
   TRANGTHAI     int            NOT NULL DEFAULT 1, -- 1 = hoạt động, 0 = khóa
   CONSTRAINT PK_KHACHHANG PRIMARY KEY (MAKHACHHANG),
   CONSTRAINT UQ_KHACHHANG_EMAIL UNIQUE (EMAIL)
);
GO

/*==============================================================*/
/* Table: NHANVIEN (Nhân viên / Admin)                           */
/*==============================================================*/
CREATE TABLE NHANVIEN (
   MANHANVIEN         varchar(20)    NOT NULL,
   TENDANGNHAP        nvarchar(50)   NOT NULL,
   MATKHAU            nvarchar(200)  NOT NULL,  -- mở rộng cho mật khẩu hash
   TENNV              nvarchar(100)  NULL,
   NGAYSINH           date           NULL,       -- sửa: nvarchar -> date
   GIOITINH           nvarchar(10)   NULL,
   EMAIL              nvarchar(100)  NOT NULL,
   SODT               nvarchar(15)   NULL,
   DIACHINV           nvarchar(200)  NULL,
   VAITROPHUTRACH     nvarchar(30)   NOT NULL DEFAULT N'Staff', -- 'Admin' | 'Staff'
   TRANGTHAILAMVIEC   nvarchar(30)   NULL,
   TRANGTHAI          int            NOT NULL DEFAULT 1,
   CONSTRAINT PK_NHANVIEN PRIMARY KEY (MANHANVIEN),
   CONSTRAINT UQ_NHANVIEN_EMAIL UNIQUE (EMAIL)
);
GO

/*==============================================================*/
/* Table: KHUYENMAI (Khuyến mãi)                                 */
/*==============================================================*/
CREATE TABLE KHUYENMAI (
   MAKHUYENMAI  varchar(20)    NOT NULL,
   MAGIAMGIA    varchar(20)    NULL,
   MUCGIAM      decimal(5,2)   NULL,   -- sửa: nvarchar -> decimal (% giảm giá)
   NGAYBATDAU   datetime       NULL,
   NGAYKETTHUC  datetime       NULL,
   LAGIVEAWAY   bit            NOT NULL DEFAULT 0, -- sửa: nvarchar -> bit (true/false)
   CONSTRAINT PK_KHUYENMAI PRIMARY KEY (MAKHUYENMAI)
);
GO

/*==============================================================*/
/* Table: GIOHANG (Giỏ hàng - BẢNG MỚI, schema gốc chưa có)      */
/*==============================================================*/
CREATE TABLE GIOHANG (
   MAGIOHANG    int IDENTITY(1,1) NOT NULL,
   MAKHACHHANG  varchar(20)  NOT NULL,
   MASACH       varchar(20)  NOT NULL,
   SOLUONG      int          NOT NULL DEFAULT 1,
   CONSTRAINT PK_GIOHANG PRIMARY KEY (MAGIOHANG),
   CONSTRAINT UQ_GIOHANG_KH_SACH UNIQUE (MAKHACHHANG, MASACH), -- 1 khách chỉ có 1 dòng/sách trong giỏ
   CONSTRAINT FK_GIOHANG_KHACHHANG FOREIGN KEY (MAKHACHHANG) REFERENCES KHACHHANG (MAKHACHHANG),
   CONSTRAINT FK_GIOHANG_SACH FOREIGN KEY (MASACH) REFERENCES SACH (MASACH)
);
GO

/*==============================================================*/
/* Table: HOADON (Hóa đơn / Đơn hàng)                            */
/*==============================================================*/
CREATE TABLE HOADON (
   MAHOADON            varchar(20)     NOT NULL,
   MANHANVIEN          varchar(20)     NULL,       -- sửa: cho phép null (đơn online chưa cần NV xử lý ngay)
   MAKHACHHANG         varchar(20)     NOT NULL,    -- sửa: bỏ chữ G thừa
   MAKHUYENMAI         varchar(20)     NULL,        -- sửa: cho phép null (không phải đơn nào cũng có KM)
   NGAYDATHANG         datetime        NOT NULL DEFAULT GETDATE(),
   NGAYGIAHANG         datetime        NULL,
   DIACHIGIAOHANG      nvarchar(200)   NOT NULL,    -- THÊM: địa chỉ giao hàng riêng cho từng đơn
   SODIENTHOAINHAN     varchar(15)     NOT NULL,    -- THÊM: SĐT người nhận riêng cho từng đơn
   TRANGTHAIGIAOHANG   nvarchar(30)    NOT NULL DEFAULT N'ChoXuLy',
   PHIVANCHUYEN        decimal(18,2)   NOT NULL DEFAULT 0,
   GIAMGIA             decimal(5,2)    NOT NULL DEFAULT 0,
   TONGTIEN            decimal(18,2)   NOT NULL DEFAULT 0, -- THÊM: tổng tiền đơn hàng
   CONSTRAINT PK_HOADON PRIMARY KEY (MAHOADON),
   CONSTRAINT FK_HOADON_NHANVIEN FOREIGN KEY (MANHANVIEN) REFERENCES NHANVIEN (MANHANVIEN),
   CONSTRAINT FK_HOADON_KHACHHANG FOREIGN KEY (MAKHACHHANG) REFERENCES KHACHHANG (MAKHACHHANG),
   CONSTRAINT FK_HOADON_KHUYENMAI FOREIGN KEY (MAKHUYENMAI) REFERENCES KHUYENMAI (MAKHUYENMAI)
);
GO

/*==============================================================*/
/* Table: CHITIETHOADON (Chi tiết hóa đơn)                       */
/*==============================================================*/
CREATE TABLE CHITIETHOADON (
   MACTHD     int IDENTITY(1,1) NOT NULL, -- sửa: char(10) cố định -> int tự tăng cho đơn giản
   MAHOADON   varchar(20)     NOT NULL,
   MASACH     varchar(20)     NOT NULL,
   SOLUONG    int             NOT NULL,      -- sửa: nvarchar -> int
   DONGIA     decimal(18,2)   NOT NULL,      -- sửa: nvarchar -> decimal
   TONGTIEN   decimal(18,2)   NOT NULL,      -- sửa: nvarchar -> decimal
   CONSTRAINT PK_CHITIETHOADON PRIMARY KEY (MACTHD),
   CONSTRAINT FK_CTHD_HOADON FOREIGN KEY (MAHOADON) REFERENCES HOADON (MAHOADON),
   CONSTRAINT FK_CTHD_SACH FOREIGN KEY (MASACH) REFERENCES SACH (MASACH)
);
GO

CREATE INDEX IX_CTHD_HOADON ON CHITIETHOADON (MAHOADON);
CREATE INDEX IX_CTHD_SACH ON CHITIETHOADON (MASACH);
CREATE INDEX IX_HOADON_KHACHHANG ON HOADON (MAKHACHHANG);
CREATE INDEX IX_HOADON_NHANVIEN ON HOADON (MANHANVIEN);
CREATE INDEX IX_HOADON_KHUYENMAI ON HOADON (MAKHUYENMAI);
GO

/*==============================================================*/
/* Dữ liệu mẫu                                                  */
/*==============================================================*/
INSERT INTO DANHMUC (MADANHMUC, TENDANHMUC, MOTA) VALUES
('DM01', N'Văn học', N'Tiểu thuyết, truyện ngắn'),
('DM02', N'Kỹ năng sống', N'Sách phát triển bản thân'),
('DM03', N'Kinh tế', N'Sách kinh doanh, tài chính'),
('DM04', N'Thiếu nhi', N'Sách dành cho trẻ em'),
('DM05', N'Ngoại ngữ', N'Sách học ngoại ngữ');
GO

INSERT INTO SACH (MASACH, TENSACH, TACGIA, GIABAN, SOLUONGTON, LOAISACH, NAMXUATBAN, SOTRANG, NGONNGU, ANHSACH) VALUES
('S001', N'Nhà Giả Kim', N'Paulo Coelho', 79000, 50, N'Văn học', 1988, 228, N'Tiếng Việt', 'https://placehold.co/300x420/E39691/FFF?text=Nha+Gia+Kim'),
('S002', N'Đắc Nhân Tâm', N'Dale Carnegie', 86000, 40, N'Kỹ năng sống', 1936, 320, N'Tiếng Việt', 'https://placehold.co/300x420/D88883/FFF?text=Dac+Nhan+Tam'),
('S003', N'Cha Giàu Cha Nghèo', N'Robert Kiyosaki', 95000, 30, N'Kinh tế', 1997, 336, N'Tiếng Việt', 'https://placehold.co/300x420/6E3335/FFF?text=Cha+Giau+Cha+Ngheo'),
('S004', N'Hoàng Tử Bé', N'Antoine de Saint-Exupéry', 65000, 60, N'Thiếu nhi', 1943, 96, N'Tiếng Việt', 'https://placehold.co/300x420/F3C9C6/6E3335?text=Hoang+Tu+Be'),
('S005', N'Doraemon - Tập 1', N'Fujiko F. Fujio', 25000, 100, N'Thiếu nhi', 1969, 190, N'Tiếng Việt', 'https://placehold.co/300x420/E8A6A0/FFF?text=Doraemon'),
('S006', N'Nhà Khuyến Học', N'Fukuzawa Yukichi', 68000, 35, N'Văn học', 1872, 220, N'Tiếng Việt', 'https://placehold.co/300x420/C97874/FFF?text=Nha+Khuyen+Hoc'),
('S007', N'Tuổi Trẻ Đáng Giá Bao Nhiêu', N'Rosie Nguyễn', 72000, 45, N'Kỹ năng sống', 2016, 250, N'Tiếng Việt', 'https://placehold.co/300x420/D07E78/FFF?text=Tuoi+Tre'),
('S008', N'Nhà Kinh Tế Học Tự Nhiên', N'Robert H. Frank', 89000, 20, N'Kinh tế', 2007, 280, N'Tiếng Việt', 'https://placehold.co/300x420/B0827E/FFF?text=Kinh+Te+Hoc'),
('S009', N'Totto-chan Bên Cửa Sổ', N'Kuroyanagi Tetsuko', 78000, 55, N'Thiếu nhi', 1981, 264, N'Tiếng Việt', 'https://placehold.co/300x420/F6DCDA/6E3335?text=Totto-chan'),
('S010', N'English Grammar in Use', N'Raymond Murphy', 145000, 25, N'Ngoại ngữ', 2019, 380, N'Tiếng Anh', 'https://placehold.co/300x420/8C5A56/FFF?text=Grammar+in+Use'),
('S011', N'IELTS Cambridge 18', N'Cambridge University Press', 210000, 18, N'Ngoại ngữ', 2023, 160, N'Tiếng Anh', 'https://placehold.co/300x420/6E3335/FFF?text=IELTS+18'),
('S012', N'Từ Điển Anh - Việt', N'Viện Ngôn Ngữ Học', 120000, 22, N'Ngoại ngữ', 2020, 900, N'Song ngữ', 'https://placehold.co/300x420/9A7A78/FFF?text=Tu+Dien');
GO

INSERT INTO GOM (MASACH, MADANHMUC) VALUES
('S001', 'DM01'), ('S002', 'DM02'), ('S003', 'DM03'), ('S004', 'DM04'), ('S005', 'DM04'),
('S006', 'DM01'), ('S007', 'DM02'), ('S008', 'DM03'), ('S009', 'DM04'),
('S010', 'DM05'), ('S011', 'DM05'), ('S012', 'DM05');
GO

/*==============================================================*/
/* Nhà cung cấp                                                 */
/*==============================================================*/
INSERT INTO NHACUNGCAP (MANHACUNGCAP, TENNHACUNGCAP, MOTA) VALUES
('NCC01', N'Công ty CP Sách First News', N'Chuyên phát hành sách văn học và kỹ năng sống'),
('NCC02', N'NXB Trẻ', N'Nhà xuất bản đầu sách thiếu nhi, văn học trong nước'),
('NCC03', N'Công ty TNHH Sách Ngoại Văn', N'Chuyên nhập khẩu sách ngoại ngữ, tài liệu luyện thi quốc tế');
GO

INSERT INTO SACH_NHACUNGCAP (MANHACUNGCAP, MASACH) VALUES
('NCC01', 'S001'), ('NCC01', 'S002'), ('NCC01', 'S007'),
('NCC02', 'S004'), ('NCC02', 'S005'), ('NCC02', 'S006'), ('NCC02', 'S009'),
('NCC01', 'S003'), ('NCC01', 'S008'),
('NCC03', 'S010'), ('NCC03', 'S011'), ('NCC03', 'S012');
GO

/*==============================================================*/
/* Khuyến mãi                                                   */
/*==============================================================*/
INSERT INTO KHUYENMAI (MAKHUYENMAI, MAGIAMGIA, MUCGIAM, NGAYBATDAU, NGAYKETTHUC, LAGIVEAWAY) VALUES
('KM01', 'SUMMER10', 10.00, '2026-06-01', '2026-08-31', 0),
('KM02', 'NEWMEMBER', 15.00, '2026-01-01', '2026-12-31', 0),
('KM03', 'FREESHIP', 0.00, '2026-07-01', '2026-07-31', 1);
GO

-- Tài khoản test (KH001/test@bookstore.com và NV001/admin@bookstore.com) sẽ được
-- backend (DbSeeder.cs) tự động tạo khi chạy lần đầu, dùng BCrypt.Net để băm mật khẩu
-- thật (không hardcode chuỗi hash trong SQL vì dễ sai/không khớp thuật toán).
