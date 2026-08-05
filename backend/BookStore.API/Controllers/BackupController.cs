using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class BackupController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly string _databaseName;
        private readonly string _backupFolder;

        public BackupController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            
            // 🔴 SỬA LỖI 1: Tên Database phải khớp 100% với tên trong SQL Server của bạn
            _databaseName = "BANSACH"; 
            
            _backupFolder = @"D:\Web_bansach_fullstack\Backups"; 

            if (!Directory.Exists(_backupFolder))
            {
                Directory.CreateDirectory(_backupFolder);
            }
        }

        // =====================================
        // API 1: TẠO BẢN SAO LƯU (BACKUP)
        // =====================================
        [HttpPost("backup")]
        public async Task<IActionResult> BackupDatabase()
        {
            try
            {
                string fileName = $"Backup_{DateTime.Now:yyyyMMdd_HHmmss}.bak";
                string backupPath = Path.Combine(_backupFolder, fileName);

                string backupQuery = $"BACKUP DATABASE [{_databaseName}] TO DISK = '{backupPath}' WITH FORMAT";

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    using (SqlCommand cmd = new SqlCommand(backupQuery, conn))
                    {
                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return Ok(new { message = "Đã sao lưu dữ liệu thành công!", filePath = backupPath, fileName = fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi sao lưu: " + ex.Message });
            }
        }

        // =====================================
        // API 2: LẤY DANH SÁCH CÁC FILE .BAK CÓ SẴN
        // =====================================
        [HttpGet("files")]
        public IActionResult GetBackupFiles()
        {
            try
            {
                if (!Directory.Exists(_backupFolder))
                {
                    return Ok(new List<string>());
                }

                var files = Directory.GetFiles(_backupFolder, "*.bak")
                                     .Select(Path.GetFileName)
                                     .OrderByDescending(f => f)
                                     .ToList();

                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi lấy danh sách file: " + ex.Message });
            }
        }

        // =====================================
        // API 3: PHỤC HỒI DỮ LIỆU (RESTORE)
        // =====================================
        [HttpPost("restore")]
        public async Task<IActionResult> RestoreDatabase([FromBody] RestoreRequest request)
        {
            try
            {
                string backupPath = Path.Combine(_backupFolder, request.FileName);
                if (!System.IO.File.Exists(backupPath))
                {
                    return NotFound(new { message = "Không tìm thấy file sao lưu này!" });
                }

                SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder(_connectionString)
                {
                    InitialCatalog = "master" // Bắt buộc trỏ về master để có quyền ghi đè DB hiện tại
                };

                using (SqlConnection conn = new SqlConnection(builder.ConnectionString))
                {
                    await conn.OpenAsync();
                    
                    // 1. Ngắt kết nối của các user/app khác để tránh lỗi "Database in use"
                    string killConnectionsQuery = $"ALTER DATABASE [{_databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE";
                    using (SqlCommand cmd1 = new SqlCommand(killConnectionsQuery, conn)) { await cmd1.ExecuteNonQueryAsync(); }

                    // 2. Phục hồi dữ liệu
                    string restoreQuery = $"RESTORE DATABASE [{_databaseName}] FROM DISK = '{backupPath}' WITH REPLACE";
                    using (SqlCommand cmd2 = new SqlCommand(restoreQuery, conn)) { await cmd2.ExecuteNonQueryAsync(); }

                    // 3. Mở lại kết nối đa người dùng
                    string multiUserQuery = $"ALTER DATABASE [{_databaseName}] SET MULTI_USER";
                    using (SqlCommand cmd3 = new SqlCommand(multiUserQuery, conn)) { await cmd3.ExecuteNonQueryAsync(); }
                }

                // 🔴 SỬA LỖI 2: Dọn dẹp bộ nhớ đệm kết nối của EF Core/ADO.NET để tránh lỗi sập web sau khi Restore
                SqlConnection.ClearAllPools();

                return Ok(new { message = "Đã phục hồi dữ liệu thành công! Vui lòng tải lại trang web." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi phục hồi dữ liệu: " + ex.Message });
            }
        }
    }

    public class RestoreRequest
    {
        public string FileName { get; set; } = string.Empty;
    }
}