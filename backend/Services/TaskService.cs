using Apex.Api.Data;
using Apex.Api.DTOs;
using Apex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Services;

public class TaskService
{
    private readonly ApexDbContext _db;

    public TaskService(ApexDbContext db) => _db = db;

    public async Task<List<TaskDto>> GetAllAsync(Guid? categoryId = null)
    {
        var query = _db.Tasks
            .Include(t => t.Category)
            .Include(t => t.Subtasks)
            .Where(t => t.ParentTaskId == null)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId);

        var tasks = await query
            .OrderBy(t => t.IsCompleted)
            .ThenBy(t => t.Priority)
            .ThenBy(t => t.DueDate)
            .ToListAsync();

        return tasks.Select(MapToDto).ToList();
    }

    public async Task<TaskDto?> GetByIdAsync(Guid id)
    {
        var task = await _db.Tasks
            .Include(t => t.Category)
            .Include(t => t.Subtasks)
            .FirstOrDefaultAsync(t => t.Id == id);

        return task is null ? null : MapToDto(task);
    }

    public async Task<TaskDto> CreateAsync(CreateTaskRequest request)
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Priority = request.Priority,
            DueDate = request.DueDate,
            CategoryId = request.CategoryId,
            ParentTaskId = request.ParentTaskId
        };

        _db.Tasks.Add(task);

        if (request.Subtasks is { Count: > 0 })
        {
            foreach (var sub in request.Subtasks)
            {
                _db.Tasks.Add(new TaskItem
                {
                    Id = Guid.NewGuid(),
                    Title = sub.Title,
                    Priority = sub.Priority,
                    DueDate = sub.DueDate,
                    CategoryId = sub.CategoryId ?? request.CategoryId,
                    ParentTaskId = task.Id
                });
            }
        }

        await _db.SaveChangesAsync();
        return (await GetByIdAsync(task.Id))!;
    }

    public async Task<TaskDto?> ToggleAsync(Guid id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return null;

        task.IsCompleted = !task.IsCompleted;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var task = await _db.Tasks
            .Include(t => t.Subtasks)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task is null) return false;

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<TaskDto>> GetTodayPendingAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var start = new DateTimeOffset(today.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var end = start.AddDays(1);

        var tasks = await _db.Tasks
            .Include(t => t.Category)
            .Where(t => !t.IsCompleted && t.DueDate >= start && t.DueDate < end)
            .OrderBy(t => t.Priority)
            .ThenBy(t => t.DueDate)
            .ToListAsync();

        return tasks.Select(t => MapToDto(t)).ToList();
    }

    public async Task<List<TaskDto>> GetDueWithinHoursAsync(int hours)
    {
        var now = DateTimeOffset.UtcNow;
        var deadline = now.AddHours(hours);

        var tasks = await _db.Tasks
            .Include(t => t.Category)
            .Where(t => !t.IsCompleted && t.DueDate != null && t.DueDate <= deadline && t.DueDate >= now)
            .ToListAsync();

        return tasks.Select(t => MapToDto(t)).ToList();
    }

    private static TaskDto MapToDto(TaskItem task) => new(
        task.Id,
        task.Title,
        task.Priority,
        task.IsCompleted,
        task.DueDate,
        task.CategoryId,
        task.Category?.Name,
        task.Category?.ColorHex,
        task.ParentTaskId,
        task.Subtasks?.Count > 0
            ? task.Subtasks.Select(s => MapToDto(s)).ToList()
            : null
    );
}
