using Apex.Api.Data;
using Apex.Api.DTOs;
using Apex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Services;

public class HealthService
{
    private readonly ApexDbContext _db;

    public HealthService(ApexDbContext db) => _db = db;

    public async Task<HealthLogDto> UpsertAsync(HealthWebhookRequest request)
    {
        var logDate = DateOnly.Parse(request.Date);
        var log = await _db.HealthLogs.FirstOrDefaultAsync(h => h.LogDate == logDate);

        if (log is null)
        {
            log = new HealthLog
            {
                Id = Guid.NewGuid(),
                LogDate = logDate
            };
            _db.HealthLogs.Add(log);
        }

        log.StepCount = request.Steps;
        log.SleepHours = request.SleepHours;
        log.WeightLbs = request.WeightLbs;

        await _db.SaveChangesAsync();

        return new HealthLogDto(log.Id, log.LogDate.ToString("yyyy-MM-dd"),
            log.StepCount, log.SleepHours, log.WeightLbs);
    }

    public async Task<List<HealthLogDto>> GetRecentAsync(int days = 30)
    {
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
        var logs = await _db.HealthLogs
            .Where(h => h.LogDate >= cutoff)
            .OrderByDescending(h => h.LogDate)
            .ToListAsync();

        return logs.Select(l => new HealthLogDto(
            l.Id, l.LogDate.ToString("yyyy-MM-dd"),
            l.StepCount, l.SleepHours, l.WeightLbs)).ToList();
    }
}
