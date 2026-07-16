using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces;

public interface ISachRepository
{
    Task<(List<Sach> items, int total)> SearchAsync(string? keyword, string? maDanhMuc, int page, int pageSize);
    Task<Sach?> GetByIdAsync(string id);
    Task<List<DanhMuc>> GetDanhMucsAsync();
    Task<Sach> AddAsync(Sach sach, string maDanhMuc);
    Task UpdateAsync(Sach sach, string maDanhMuc);
    Task<bool> DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
}
