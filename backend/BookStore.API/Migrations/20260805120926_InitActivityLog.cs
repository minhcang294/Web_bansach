using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.API.Migrations
{
    /// <inheritdoc />
    public partial class InitActivityLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ĐÃ XÓA TRỐNG ĐỂ BỎ QUA VIỆC TẠO BẢNG
            // Do database phục hồi từ file .bak đã có sẵn đầy đủ các bảng rồi.
            // Chạy qua hàm này hệ thống sẽ tự động đồng bộ mà không báo lỗi trùng lặp.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Để trống
        }
    }
}