using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using BookStore.API.Data; // Chứa ApplicationDbContext
using BookStore.API.Models.Entities;
using BookStore.API.Models; // Chứa model NhaCungCap

namespace BookStore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NhaCungCapController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NhaCungCapController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách Nhà cung cấp (Cho cái bảng và cái Dropdown)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NhaCungCap>>> GetNhaCungCaps()
        {
            return await _context.NhaCungCaps.ToListAsync();
        }

        // Thêm Nhà cung cấp mới (Khi bạn bấm nút Thêm màu xanh)
        [HttpPost]
        public async Task<ActionResult<NhaCungCap>> PostNhaCungCap(NhaCungCap nhaCungCap)
        {
            _context.NhaCungCaps.Add(nhaCungCap);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Thêm nhà cung cấp thành công!" });
        }

        // Cập nhật thông tin (Khi bạn bấm nút Sửa)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNhaCungCap(string id, NhaCungCap nhaCungCap)
        {
            if (id != nhaCungCap.MaNhaCungCap) return BadRequest();

            _context.Entry(nhaCungCap).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công!" });
        }

        // Xóa nhà cung cấp (Khi bạn bấm nút Xóa)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNhaCungCap(string id)
        {
            var ncc = await _context.NhaCungCaps.FindAsync(id);
            if (ncc == null) return NotFound();

            _context.NhaCungCaps.Remove(ncc);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thành công!" });
        }
    }
}