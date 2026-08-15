namespace Apex.Api.Models;

public class UserAccount
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public int CurrentStreak { get; set; } = 0;
    public DateTimeOffset LastLoginDate { get; set; }
}
