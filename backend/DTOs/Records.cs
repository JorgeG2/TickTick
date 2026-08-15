using Apex.Api.Models;

namespace Apex.Api.DTOs;

public record TaskDto(
    Guid Id,
    string Title,
    PriorityLevel Priority,
    bool IsCompleted,
    DateTimeOffset? DueDate,
    Guid? CategoryId,
    string? CategoryName,
    string? CategoryColor,
    Guid? ParentTaskId,
    List<TaskDto>? Subtasks
);

public record CreateTaskRequest(
    string Title,
    PriorityLevel Priority,
    DateTimeOffset? DueDate,
    Guid? CategoryId,
    Guid? ParentTaskId,
    List<CreateTaskRequest>? Subtasks
);

public record UpdateTaskRequest(
    string? Title,
    PriorityLevel? Priority,
    DateTimeOffset? DueDate,
    Guid? CategoryId
);

public record CalendarEntryDto(
    Guid? Id,
    string Date,
    string? BlockNoteJson,
    string? ExcalidrawJson
);

public record UpdateCalendarRequest(
    string? BlockNoteJson,
    string? ExcalidrawJson
);

public record GeneratePlanRequest(
    string Goal,
    string TimelineDate,
    string IntensityLevel,
    string UserContext
);

public record GeneratePlanResponse(
    string Goal,
    int TasksCreated,
    List<TaskDto> Tasks
);

public record HealthWebhookRequest(
    string Date,
    int Steps,
    decimal SleepHours,
    decimal WeightLbs
);

public record HealthLogDto(
    Guid Id,
    string Date,
    int StepCount,
    decimal SleepHours,
    decimal WeightLbs
);

public record ShoppingItemDto(
    Guid Id,
    string Name,
    decimal EstimatedPrice,
    bool IsPurchased
);

public record CategoryDto(
    Guid Id,
    string Name,
    string ColorHex
);

public record UserAccountDto(
    Guid Id,
    string Email,
    int CurrentStreak,
    DateTimeOffset LastLoginDate
);
