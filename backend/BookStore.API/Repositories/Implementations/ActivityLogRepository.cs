using BookStore.API.Data;
using BookStore.API.Models.Entities;
using BookStore.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookStore.API.Repositories.Implementations
{
    public class ActivityLogRepository : IActivityLogRepository
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddLogAsync(ActivityLog log)
        {
            if (log.Timestamp == default)
            {
                log.Timestamp = DateTime.Now;
            }
            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task LogActionAsync(string userId, string action, string entityType, string details)
        {
            var log = new ActivityLog
            {
                UserId = userId,
                Action = action,
                EntityType = entityType,
                Details = details,
                Timestamp = DateTime.Now 
            };

            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ActivityLog>> GetRecentLogsAsync(int count = 50)
        {
            return await _context.ActivityLogs
                                 .OrderByDescending(x => x.Timestamp)
                                 .Take(count)
                                 .ToListAsync();
        }

        public async Task AddAsync(ActivityLog activityLog)
        {
            await AddLogAsync(activityLog);
        }
    }
}