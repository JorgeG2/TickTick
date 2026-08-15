namespace Apex.Api.Models;

public class Category
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string ColorHex { get; set; }

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
