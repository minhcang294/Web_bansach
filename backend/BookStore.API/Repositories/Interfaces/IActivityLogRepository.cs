using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces
{
    public interface IActivityLogRepository
    {
        // Hàm dùng để ghi lại 1 hành động mới
        Task LogActionAsync(string userId, string action, string entityType, string details);
        
        // Hàm dùng để lấy danh sách log ra xem (lấy 50 cái mới nhất)
        Task<List<ActivityLog>> GetRecentLogsAsync(int count = 50); 
    }
}