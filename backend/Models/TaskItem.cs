namespace Apex.Api.Models;

public class TaskItem
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public PriorityLevel Priority { get; set; } = PriorityLevel.Day;
    public bool IsCompleted { get; set; } = false;
    public DateTimeOffset? DueDate { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? ParentTaskId { get; set; }

    public Category? Category { get; set; }
    public TaskItem? ParentTask { get; set; }
    public ICollection<TaskItem> Subtasks { get; set; } = new List<TaskItem>();
}
