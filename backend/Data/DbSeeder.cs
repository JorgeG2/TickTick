using Apex.Api.Data;
using Apex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApexDbContext db)
    {
        if (await db.Categories.AnyAsync()) return;

        var workId = Guid.NewGuid();
        var schoolId = Guid.NewGuid();
        var personalId = Guid.NewGuid();

        db.Categories.AddRange(
            new Category { Id = workId, Name = "Work", ColorHex = "#6366F1" },
            new Category { Id = schoolId, Name = "School", ColorHex = "#F59E0B" },
            new Category { Id = personalId, Name = "Personal", ColorHex = "#10B981" }
        );

        db.UserAccounts.Add(new UserAccount
        {
            Id = Guid.NewGuid(),
            Email = "user@apex.local",
            CurrentStreak = 5,
            LastLoginDate = DateTimeOffset.UtcNow
        });

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var tomorrow = today.AddDays(1);

        db.Tasks.AddRange(
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Review project requirements",
                Priority = PriorityLevel.Day,
                DueDate = DateTimeOffset.UtcNow.Date,
                CategoryId = workId
            },
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Complete weekly report",
                Priority = PriorityLevel.Week,
                DueDate = tomorrow.ToDateTime(TimeOnly.MinValue),
                CategoryId = workId
            },
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Study for midterm exam",
                Priority = PriorityLevel.Week,
                DueDate = today.AddDays(3).ToDateTime(TimeOnly.MinValue),
                CategoryId = schoolId
            },
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Plan monthly budget",
                Priority = PriorityLevel.Month,
                DueDate = today.AddDays(14).ToDateTime(TimeOnly.MinValue),
                CategoryId = personalId
            }
        );

        db.CalendarEntries.Add(new CalendarEntry
        {
            Id = Guid.NewGuid(),
            EntryDate = today,
            BlockNoteJson = """[{"type":"paragraph","content":[{"type":"text","text":"Welcome to Apex!","styles":{}}]}]"""
        });

        db.ShoppingItems.AddRange(
            new ShoppingItem { Id = Guid.NewGuid(), Name = "Milk", EstimatedPrice = 4.99m },
            new ShoppingItem { Id = Guid.NewGuid(), Name = "Bread", EstimatedPrice = 3.49m },
            new ShoppingItem { Id = Guid.NewGuid(), Name = "Eggs", EstimatedPrice = 5.99m, IsPurchased = true }
        );

        db.HealthLogs.Add(new HealthLog
        {
            Id = Guid.NewGuid(),
            LogDate = today,
            StepCount = 8432,
            SleepHours = 7.5m,
            WeightLbs = 165.0m
        });

        await db.SaveChangesAsync();
    }
}
