using Apex.Api.Data;
using Apex.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Services;

public class CronWorkerService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<CronWorkerService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    public CronWorkerService(IServiceProvider services, ILogger<CronWorkerService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("CronWorkerService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ValidateStreaksAsync(stoppingToken);
                await SendNotificationsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CronWorkerService cycle");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task ValidateStreaksAsync(CancellationToken ct)
    {
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApexDbContext>();

        var users = await db.UserAccounts.ToListAsync(ct);
        var cutoff = DateTimeOffset.UtcNow.AddHours(-48);
        var resetCount = 0;

        foreach (var user in users)
        {
            if (user.LastLoginDate < cutoff && user.CurrentStreak > 0)
            {
                user.CurrentStreak = 0;
                resetCount++;
            }
        }

        if (resetCount > 0)
        {
            await db.SaveChangesAsync(ct);
            _logger.LogInformation("Reset streak for {Count} user(s)", resetCount);
        }
    }

    private async Task SendNotificationsAsync(CancellationToken ct)
    {
        using var scope = _services.CreateScope();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();
        await emailService.SendDueTaskRemindersAsync(ct);
    }
}
