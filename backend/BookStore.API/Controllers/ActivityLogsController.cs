using BookStore.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Bảo mật: Chỉ Admin mới được xem Nhật ký
    public class ActivityLogsController : ControllerBase
    {
        private readonly IActivityLogRepository _logRepo;

        public ActivityLogsController(IActivityLogRepository logRepo)
        {
            _logRepo = logRepo;
        }

        // GET: api/activitylogs
        [HttpGet]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _logRepo.GetRecentLogsAsync(100); // Lấy 100 dòng mới nhất
            return Ok(logs);
        }
    }
}