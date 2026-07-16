using BookStore.API.Models.Entities;

namespace BookStore.API.Repositories.Interfaces;

public interface INhanVienRepository
{
    Task<NhanVien?> GetByEmailAsync(string email);
}
