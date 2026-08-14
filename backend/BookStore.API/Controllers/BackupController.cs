using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BackupController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly string _databaseName;
        
        // Đường dẫn trong mắt Backend C# (để đọc danh sách file)
        private readonly string _csharpFolder = "/app/backups"; 
        
        // Đường dẫn trong mắt SQL Server (để lưu file)
        private readonly string _sqlFolder = "/var/opt/mssql/backup";

        public BackupController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _databaseName = "BookStoreDB"; 

            if (!Directory.Exists(_csharpFolder))
            {
                Directory.CreateDirectory(_csharpFolder);
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
                
                // Gửi đường dẫn chuẩn của SQL cho SQL Server thực thi
                string sqlBackupPath = $"{_sqlFolder}/{fileName}";
                string backupQuery = $"BACKUP DATABASE [{_databaseName}] TO DISK = '{sqlBackupPath}' WITH FORMAT";

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();
                    using (SqlCommand cmd = new SqlCommand(backupQuery, conn))
                    {
                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return Ok(new { message = "Đã sao lưu dữ liệu thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi sao lưu: " + ex.Message });
            }
        }

        // =====================================
        // API 2: LẤY DANH SÁCH FILE 
        // =====================================
        [HttpGet("files")]
        public IActionResult GetBackupFiles()
        {
            try
            {
                if (!Directory.Exists(_csharpFolder)) return Ok(new List<string>());

                // C# sẽ đọc thư mục của nó
                var files = Directory.GetFiles(_csharpFolder, "*.bak")
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
        // API 3: PHỤC HỒI (RESTORE)
        // =====================================
        [HttpPost("restore")]
        public async Task<IActionResult> RestoreDatabase([FromBody] RestoreRequest request)
        {
            try
            {
                // 1. C# kiểm tra xem file có tồn tại không
                string csharpPath = Path.Combine(_csharpFolder, request.FileName);
                if (!System.IO.File.Exists(csharpPath)) return NotFound(new { message = "Không tìm thấy file sao lưu!" });

                // 2. Lệnh phục hồi gửi cho SQL Server
                string sqlRestorePath = $"{_sqlFolder}/{request.FileName}";

                SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder(_connectionString) { InitialCatalog = "master" };
                using (SqlConnection conn = new SqlConnection(builder.ConnectionString))
                {
                    await conn.OpenAsync();
                    
                    string killConnectionsQuery = $"ALTER DATABASE [{_databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE";
                    using (SqlCommand cmd1 = new SqlCommand(killConnectionsQuery, conn)) { await cmd1.ExecuteNonQueryAsync(); }

                    string restoreQuery = $"RESTORE DATABASE [{_databaseName}] FROM DISK = '{sqlRestorePath}' WITH REPLACE";
                    using (SqlCommand cmd2 = new SqlCommand(restoreQuery, conn)) { await cmd2.ExecuteNonQueryAsync(); }

                    string multiUserQuery = $"ALTER DATABASE [{_databaseName}] SET MULTI_USER";
                    using (SqlCommand cmd3 = new SqlCommand(multiUserQuery, conn)) { await cmd3.ExecuteNonQueryAsync(); }
                }

                SqlConnection.ClearAllPools();
                return Ok(new { message = "Đã phục hồi dữ liệu thành công! Vui lòng tải lại trang web." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi phục hồi: " + ex.Message });
            }
        }
    }

    public class RestoreRequest
    {
        public string FileName { get; set; } = string.Empty;
    }
}