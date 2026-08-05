using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces
{
    public interface IActivityLogRepository
    {
        // 🌟 Bổ sung dòng này để BooksController gọi được và hết gạch đỏ
        Task AddLogAsync(ActivityLog log);

        // Các hàm cũ (giữ nguyên nếu có)
        Task LogActionAsync(string userId, string action, string entityType, string details);
        Task<List<ActivityLog>> GetRecentLogsAsync(int count = 50);
    }
}