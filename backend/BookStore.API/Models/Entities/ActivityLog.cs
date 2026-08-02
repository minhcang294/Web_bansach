using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookStore.API.Models.Entities
{
    public class ActivityLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty; // Lưu ID hoặc Email của người thao tác

        [Required]
        public string Action { get; set; } = string.Empty; // Ví dụ: "Thêm mới", "Cập nhật", "Xóa"

        [Required]
        public string EntityType { get; set; } = string.Empty; // Ví dụ: "Sách", "Người Dùng", "Đơn Hàng"

        public string? Details { get; set; } // Chi tiết cụ thể. Ví dụ: "Xóa tài khoản KH001"

        public DateTime Timestamp { get; set; } = DateTime.Now; // Thời gian thực hiện
    }
}