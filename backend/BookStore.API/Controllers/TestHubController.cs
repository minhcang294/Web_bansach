using BookStore.API.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestHubController : ControllerBase
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public TestHubController(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> TestBipBip()
        {
            // Phát sóng tín hiệu bỏ qua mọi bảo mật
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", new {
                id = Guid.NewGuid().ToString(),
                type = "warning",
                title = "🔔 TEST THÀNH CÔNG!",
                message = "Đường ống SignalR đã thông suốt từ Backend sang Frontend!",
                time = "Vừa xong",
                isRead = false
            });

            return Ok(new { message = "Đã bắn tín hiệu thành công! Hãy kiểm tra chiếc chuông bên ReactJS." });
        }
    }
}