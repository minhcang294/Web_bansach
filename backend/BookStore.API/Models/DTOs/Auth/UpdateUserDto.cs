namespace BookStore.API.Models.DTOs.Auth;

public class UpdateUserDto 
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }     // 👉 Bổ sung Số điện thoại
    public string? Address { get; set; }   // 👉 Bổ sung Địa chỉ
    public string? Role { get; set; }
    public int Status { get; set; }
}