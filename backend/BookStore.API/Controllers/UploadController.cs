using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace BookStore.API.Controllers
{
    // ĐÃ FIX 1: Chốt cứng tên đường dẫn là "api/upload" để khớp 100% với React
    [Route("api/upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost]
        [Consumes("multipart/form-data")] // ĐÃ FIX 2: Thêm dòng này để Swagger vẽ nút Upload File chuẩn xác
        // ĐÃ GỠ BỎ: [FromForm] vì .NET tự hiểu IFormFile, để lại sẽ làm sập Swagger
        public async Task<IActionResult> UploadImage(IFormFile file) 
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn một file ảnh." });
            }

            try
            {
                string webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                string uploadsFolder = Path.Combine(webRootPath, "uploads");
                
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                string uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                return Ok(new { imageUrl = $"/uploads/{uniqueFileName}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi lưu file: {ex.Message}" });
            }
        }
    }
}