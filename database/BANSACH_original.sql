/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2008                    */
/* Created on:     7/11/2026 11:42:25 PM                        */
/*==============================================================*/


if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ASSOCIATION_10') and o.name = 'FK_ASSOCIAT_ASSOCIATI_NHACUNGC')
alter table ASSOCIATION_10
   drop constraint FK_ASSOCIAT_ASSOCIATI_NHACUNGC
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ASSOCIATION_10') and o.name = 'FK_ASSOCIAT_ASSOCIATI_SACH')
alter table ASSOCIATION_10
   drop constraint FK_ASSOCIAT_ASSOCIATI_SACH
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('CHITIETHOADON') and o.name = 'FK_CHITIETH_ASSOCIATI_SACH')
alter table CHITIETHOADON
   drop constraint FK_CHITIETH_ASSOCIATI_SACH
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('CHITIETHOADON') and o.name = 'FK_CHITIETH_THUOC_HOADON')
alter table CHITIETHOADON
   drop constraint FK_CHITIETH_THUOC_HOADON
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('GOM') and o.name = 'FK_GOM_GOM_SACH')
alter table GOM
   drop constraint FK_GOM_GOM_SACH
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('GOM') and o.name = 'FK_GOM_GOM2_DANHMUC')
alter table GOM
   drop constraint FK_GOM_GOM2_DANHMUC
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('HOADON') and o.name = 'FK_HOADON_ASSOCIATI_NHANVIEN')
alter table HOADON
   drop constraint FK_HOADON_ASSOCIATI_NHANVIEN
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('HOADON') and o.name = 'FK_HOADON_CO_KHUYENMA')
alter table HOADON
   drop constraint FK_HOADON_CO_KHUYENMA
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('HOADON') and o.name = 'FK_HOADON_THANH_TOA_KHACHHAN')
alter table HOADON
   drop constraint FK_HOADON_THANH_TOA_KHACHHAN
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('ASSOCIATION_10')
            and   name  = 'ASSOCIATION_11_FK'
            and   indid > 0
            and   indid < 255)
   drop index ASSOCIATION_10.ASSOCIATION_11_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('ASSOCIATION_10')
            and   name  = 'ASSOCIATION_10_FK'
            and   indid > 0
            and   indid < 255)
   drop index ASSOCIATION_10.ASSOCIATION_10_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ASSOCIATION_10')
            and   type = 'U')
   drop table ASSOCIATION_10
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('CHITIETHOADON')
            and   name  = 'ASSOCIATION_8_FK'
            and   indid > 0
            and   indid < 255)
   drop index CHITIETHOADON.ASSOCIATION_8_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('CHITIETHOADON')
            and   name  = 'THUOC_FK'
            and   indid > 0
            and   indid < 255)
   drop index CHITIETHOADON.THUOC_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('CHITIETHOADON')
            and   type = 'U')
   drop table CHITIETHOADON
go

if exists (select 1
            from  sysobjects
           where  id = object_id('DANHMUC')
            and   type = 'U')
   drop table DANHMUC
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('GOM')
            and   name  = 'GOM2_FK'
            and   indid > 0
            and   indid < 255)
   drop index GOM.GOM2_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('GOM')
            and   name  = 'GOM_FK'
            and   indid > 0
            and   indid < 255)
   drop index GOM.GOM_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('GOM')
            and   type = 'U')
   drop table GOM
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('HOADON')
            and   name  = 'ASSOCIATION_9_FK'
            and   indid > 0
            and   indid < 255)
   drop index HOADON.ASSOCIATION_9_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('HOADON')
            and   name  = 'THANH_TOAN_FK'
            and   indid > 0
            and   indid < 255)
   drop index HOADON.THANH_TOAN_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('HOADON')
            and   name  = 'CO_FK'
            and   indid > 0
            and   indid < 255)
   drop index HOADON.CO_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('HOADON')
            and   type = 'U')
   drop table HOADON
go

if exists (select 1
            from  sysobjects
           where  id = object_id('KHACHHANG')
            and   type = 'U')
   drop table KHACHHANG
go

if exists (select 1
            from  sysobjects
           where  id = object_id('KHUYENMAI')
            and   type = 'U')
   drop table KHUYENMAI
go

if exists (select 1
            from  sysobjects
           where  id = object_id('NHACUNGCAP')
            and   type = 'U')
   drop table NHACUNGCAP
go

if exists (select 1
            from  sysobjects
           where  id = object_id('NHANVIEN')
            and   type = 'U')
   drop table NHANVIEN
go

if exists (select 1
            from  sysobjects
           where  id = object_id('SACH')
            and   type = 'U')
   drop table SACH
go

/*==============================================================*/
/* Table: ASSOCIATION_10                                        */
/*==============================================================*/
create table ASSOCIATION_10 (
   MANHACUNGCAP         varchar(30)          not null,
   MASACH               varchar(20)          not null,
   constraint PK_ASSOCIATION_10 primary key (MANHACUNGCAP, MASACH)
)
go

/*==============================================================*/
/* Index: ASSOCIATION_10_FK                                     */
/*==============================================================*/
create index ASSOCIATION_10_FK on ASSOCIATION_10 (
MANHACUNGCAP ASC
)
go

/*==============================================================*/
/* Index: ASSOCIATION_11_FK                                     */
/*==============================================================*/
create index ASSOCIATION_11_FK on ASSOCIATION_10 (
MASACH ASC
)
go

/*==============================================================*/
/* Table: CHITIETHOADON                                         */
/*==============================================================*/
create table CHITIETHOADON (
   MACTHD               char(10)             not null,
   MAHOADON             varchar(20)          not null,
   MASACH               varchar(20)          not null,
   SOLUONG              nvarchar(30)         null,
   DONGIA               nvarchar(30)         null,
   TONGTIEN             nvarchar(30)         null,
   constraint PK_CHITIETHOADON primary key (MACTHD)
)
go

/*==============================================================*/
/* Index: THUOC_FK                                              */
/*==============================================================*/
create index THUOC_FK on CHITIETHOADON (
MAHOADON ASC
)
go

/*==============================================================*/
/* Index: ASSOCIATION_8_FK                                      */
/*==============================================================*/
create index ASSOCIATION_8_FK on CHITIETHOADON (
MASACH ASC
)
go

/*==============================================================*/
/* Table: DANHMUC                                               */
/*==============================================================*/
create table DANHMUC (
   MADANHMUC            varchar(20)          not null,
   TENDANHMUC           nvarchar(30)         null,
   MOTA                 nvarchar(30)         null,
   constraint PK_DANHMUC primary key (MADANHMUC)
)
go

/*==============================================================*/
/* Table: GOM                                                   */
/*==============================================================*/
create table GOM (
   MASACH               varchar(20)          not null,
   MADANHMUC            varchar(20)          not null,
   constraint PK_GOM primary key (MASACH, MADANHMUC)
)
go

/*==============================================================*/
/* Index: GOM_FK                                                */
/*==============================================================*/
create index GOM_FK on GOM (
MASACH ASC
)
go

/*==============================================================*/
/* Index: GOM2_FK                                               */
/*==============================================================*/
create index GOM2_FK on GOM (
MADANHMUC ASC
)
go

/*==============================================================*/
/* Table: HOADON                                                */
/*==============================================================*/
create table HOADON (
   MAHOADON             varchar(20)          not null,
   MANHANVIEN           varchar(20)          not null,
   MAKHACHHANGG         varchar(20)          not null,
   MAKHUYENMAI          varchar(20)          not null,
   NGAYDATHANG          datetime             null,
   NGAYGIAHANG          datetime             null,
   TRANGTHAIGIAOHANG    nvarchar(30)         null,
   PHIVANCHUYEN         decimal(18,2)        null,
   GIAMGIA              decimal(5,2)         null,
   constraint PK_HOADON primary key (MAHOADON)
)
go

/*==============================================================*/
/* Index: CO_FK                                                 */
/*==============================================================*/
create index CO_FK on HOADON (
MAKHUYENMAI ASC
)
go

/*==============================================================*/
/* Index: THANH_TOAN_FK                                         */
/*==============================================================*/
create index THANH_TOAN_FK on HOADON (
MAKHACHHANGG ASC
)
go

/*==============================================================*/
/* Index: ASSOCIATION_9_FK                                      */
/*==============================================================*/
create index ASSOCIATION_9_FK on HOADON (
MANHANVIEN ASC
)
go

/*==============================================================*/
/* Table: KHACHHANG                                             */
/*==============================================================*/
create table KHACHHANG (
   MAKHACHHANGG         varchar(20)          not null,
   TENDANHNHAP          varchar(50)          null,
   MATKHAU              varchar(30)          null,
   HOTENKH              nvarchar(50)         null,
   EMAIL                nvarchar(50)         null,
   SODIENTHOAI          varchar(11)          null,
   DIACHIKH             nvarchar(100)        null,
   NGAYDK               datetime             null,
   TRANGTHAI            int                  null,
   constraint PK_KHACHHANG primary key (MAKHACHHANGG)
)
go

/*==============================================================*/
/* Table: KHUYENMAI                                             */
/*==============================================================*/
create table KHUYENMAI (
   MAKHUYENMAI          varchar(20)          not null,
   MAGIAMGIA            varchar(20)          null,
   MUCGIAM              nvarchar(30)         null,
   NGAYBATDAU           datetime             null,
   NGAYKETTHUC          datetime             null,
   LAGIVEAWAY           nvarchar(30)         null,
   constraint PK_KHUYENMAI primary key (MAKHUYENMAI)
)
go

/*==============================================================*/
/* Table: NHACUNGCAP                                            */
/*==============================================================*/
create table NHACUNGCAP (
   MANHACUNGCAP         varchar(30)          not null,
   TENNHACUNGCAP        nvarchar(30)         null,
   MOTA                 nvarchar(30)         null,
   constraint PK_NHACUNGCAP primary key (MANHACUNGCAP)
)
go

/*==============================================================*/
/* Table: NHANVIEN                                              */
/*==============================================================*/
create table NHANVIEN (
   MANHANVIEN           varchar(20)          not null,
   TENDANGNHAP          nvarchar(30)         null,
   MATKHAU              varchar(30)          null,
   TENNV                nvarchar(20)         null,
   NGAYSINH             nvarchar(20)         null,
   GIOITINH             nvarchar(20)         null,
   EMAIL                nvarchar(50)         null,
   SODT                 nvarchar(20)         null,
   DIACHINV             nvarchar(50)         null,
   VAITROPHUTRACH       nvarchar(20)         null,
   TRANGTHAILAMVIEC     nvarchar(30)         null,
   TRANGTHAI            int                  null,
   constraint PK_NHANVIEN primary key (MANHANVIEN)
)
go

/*==============================================================*/
/* Table: SACH                                                  */
/*==============================================================*/
create table SACH (
   MASACH               varchar(20)          not null,
   TENSACH              nvarchar(30)         null,
   TACGIA               nvarchar(30)         null,
   GIABAN               decimal(18,2)        null,
   SOLUONGTON           int                  null,
   NOIDUNGDEMO          nvarchar(30)         null,
   LOAISACH             nvarchar(30)         null,
   NAMXUATBAN           int                  null,
   SOTRANG              int                  null,
   NGONNGU              nvarchar(30)         null,
   ANHSACH              varchar(500)         null,
   constraint PK_SACH primary key (MASACH)
)
go

alter table ASSOCIATION_10
   add constraint FK_ASSOCIAT_ASSOCIATI_NHACUNGC foreign key (MANHACUNGCAP)
      references NHACUNGCAP (MANHACUNGCAP)
go

alter table ASSOCIATION_10
   add constraint FK_ASSOCIAT_ASSOCIATI_SACH foreign key (MASACH)
      references SACH (MASACH)
go

alter table CHITIETHOADON
   add constraint FK_CHITIETH_ASSOCIATI_SACH foreign key (MASACH)
      references SACH (MASACH)
go

alter table CHITIETHOADON
   add constraint FK_CHITIETH_THUOC_HOADON foreign key (MAHOADON)
      references HOADON (MAHOADON)
go

alter table GOM
   add constraint FK_GOM_GOM_SACH foreign key (MASACH)
      references SACH (MASACH)
go

alter table GOM
   add constraint FK_GOM_GOM2_DANHMUC foreign key (MADANHMUC)
      references DANHMUC (MADANHMUC)
go

alter table HOADON
   add constraint FK_HOADON_ASSOCIATI_NHANVIEN foreign key (MANHANVIEN)
      references NHANVIEN (MANHANVIEN)
go

alter table HOADON
   add constraint FK_HOADON_CO_KHUYENMA foreign key (MAKHUYENMAI)
      references KHUYENMAI (MAKHUYENMAI)
go

alter table HOADON
   add constraint FK_HOADON_THANH_TOA_KHACHHAN foreign key (MAKHACHHANGG)
      references KHACHHANG (MAKHACHHANGG)
go

