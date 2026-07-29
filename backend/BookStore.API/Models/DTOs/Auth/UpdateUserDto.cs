namespace BookStore.API.Models.DTOs.Auth;

public class UpdateUserDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public int Status { get; set; }
}