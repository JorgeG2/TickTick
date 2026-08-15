using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Apex.Api.Data;
using Apex.Api.DTOs;
using Apex.Api.Models;

namespace Apex.Api.Services;

public class AiStudyPlannerService
{
    private readonly ApexDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<AiStudyPlannerService> _logger;

    public AiStudyPlannerService(
        ApexDbContext db,
        IHttpClientFactory httpClientFactory,
        IConfiguration config,
        ILogger<AiStudyPlannerService> logger)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _config = config;
        _logger = logger;
    }

    public async Task<GeneratePlanResponse> GeneratePlanAsync(GeneratePlanRequest request)
    {
        var timelineDate = DateOnly.Parse(request.TimelineDate);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var planItems = await CallLlmOrFallbackAsync(request, today, timelineDate);

        var createdTasks = new List<TaskDto>();
        foreach (var item in planItems)
        {
            var dueDate = DateOnly.Parse(item.DueDate);
            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = item.Title,
                Priority = item.Priority,
                DueDate = new DateTimeOffset(dueDate.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero),
                IsCompleted = false
            };
            _db.Tasks.Add(task);
            createdTasks.Add(new TaskDto(
                task.Id, task.Title, task.Priority, false,
                task.DueDate, null, null, null, null, null));
        }

        await _db.SaveChangesAsync();

        return new GeneratePlanResponse(request.Goal, createdTasks.Count, createdTasks);
    }

    private async Task<List<PlanItem>> CallLlmOrFallbackAsync(
        GeneratePlanRequest request, DateOnly today, DateOnly timelineDate)
    {
        var apiKey = _config["OpenAI:ApiKey"];
        var apiUrl = _config["OpenAI:ApiUrl"] ?? "https://api.openai.com/v1/chat/completions";
        var model = _config["OpenAI:Model"] ?? "gpt-4o-mini";

        var prompt = $"""
            You are an AI study planner. Generate a structured study plan as a JSON array.
            Each item must have: title (string), dueDate (YYYY-MM-DD), priority (0=Day, 1=Week, 2=Month).

            Goal: {request.Goal}
            Timeline end date: {request.TimelineDate}
            Intensity: {request.IntensityLevel}
            User context: {request.UserContext}
            Start date: {today:yyyy-MM-dd}

            Return ONLY a valid JSON array, no markdown fences.
            """;

        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var body = new
                {
                    model,
                    messages = new[]
                    {
                        new { role = "system", content = "You are a study planning assistant. Return only JSON arrays." },
                        new { role = "user", content = prompt }
                    },
                    temperature = 0.7
                };

                var response = await client.PostAsync(
                    apiUrl,
                    new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json"));

                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var doc = JsonDocument.Parse(json);
                    var content = doc.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString() ?? "[]";

                    content = content.Trim();
                    if (content.StartsWith("```"))
                    {
                        var lines = content.Split('\n');
                        content = string.Join('\n', lines.Skip(1).TakeWhile(l => !l.StartsWith("```")));
                    }

                    var items = JsonSerializer.Deserialize<List<PlanItem>>(content,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (items is { Count: > 0 })
                        return items;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "LLM call failed, using fallback plan generator");
            }
        }

        return GenerateFallbackPlan(request, today, timelineDate);
    }

    private static List<PlanItem> GenerateFallbackPlan(
        GeneratePlanRequest request, DateOnly today, DateOnly timelineDate)
    {
        var items = new List<PlanItem>();
        var totalDays = timelineDate.DayNumber - today.DayNumber;
        if (totalDays <= 0) totalDays = 7;

        var sessionsPerWeek = request.IntensityLevel.Equals("daily", StringComparison.OrdinalIgnoreCase) ? 7 : 3;
        var interval = Math.Max(1, totalDays / Math.Max(1, (totalDays * sessionsPerWeek) / 7));

        var topics = new[]
        {
            $"Research fundamentals for: {request.Goal}",
            $"Practice exercises: {request.Goal}",
            $"Review and summarize key concepts",
            $"Apply knowledge with a mini-project",
            $"Assess progress and identify gaps",
            $"Deep dive into weak areas",
            $"Final review and consolidation"
        };

        var currentDate = today;
        for (var i = 0; i < topics.Length && currentDate <= timelineDate; i++)
        {
            items.Add(new PlanItem
            {
                Title = topics[i],
                DueDate = currentDate.ToString("yyyy-MM-dd"),
                Priority = i < 2 ? PriorityLevel.Day : PriorityLevel.Week
            });
            currentDate = currentDate.AddDays(interval);
        }

        return items;
    }

    private class PlanItem
    {
        public string Title { get; set; } = "";
        public string DueDate { get; set; } = "";
        public PriorityLevel Priority { get; set; } = PriorityLevel.Day;
    }
}
