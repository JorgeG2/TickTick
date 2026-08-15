using System.Net;
using System.Net.Mail;
using Apex.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Services;

public interface IEmailNotificationService
{
    Task SendDueTaskRemindersAsync(CancellationToken ct = default);
}

public class EmailNotificationService : IEmailNotificationService
{
    private readonly ApexDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(
        ApexDbContext db,
        IConfiguration config,
        ILogger<EmailNotificationService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task SendDueTaskRemindersAsync(CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        var deadline = now.AddHours(24);

        var dueTasks = await _db.Tasks
            .Where(t => !t.IsCompleted && t.DueDate != null && t.DueDate <= deadline && t.DueDate >= now)
            .ToListAsync(ct);

        if (dueTasks.Count == 0) return;

        var user = await _db.UserAccounts.FirstOrDefaultAsync(ct);
        if (user is null) return;

        var smtpHost = _config["Email:SmtpHost"];
        var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
        var smtpUser = _config["Email:SmtpUser"];
        var smtpPass = _config["Email:SmtpPassword"];
        var fromAddress = _config["Email:FromAddress"] ?? smtpUser;
        var sendGridKey = _config["SendGrid:ApiKey"];

        var subject = $"Apex: {dueTasks.Count} task(s) due within 24 hours";
        var body = string.Join("\n", dueTasks.Select(t =>
            $"- {t.Title} (due {t.DueDate:yyyy-MM-dd HH:mm})"));

        try
        {
            if (!string.IsNullOrWhiteSpace(sendGridKey))
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {sendGridKey}");
                var payload = new
                {
                    personalizations = new[] { new { to = new[] { new { email = user.Email } } } },
                    from = new { email = fromAddress ?? "noreply@apex.local" },
                    subject,
                    content = new[] { new { type = "text/plain", value = body } }
                };
                await client.PostAsJsonAsync("https://api.sendgrid.com/v3/mail/send", payload, ct);
                _logger.LogInformation("Sent {Count} task reminders via SendGrid", dueTasks.Count);
            }
            else if (!string.IsNullOrWhiteSpace(smtpHost) && !string.IsNullOrWhiteSpace(smtpUser))
            {
                using var smtp = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUser, smtpPass),
                    EnableSsl = true
                };
                var mail = new MailMessage(fromAddress!, user.Email, subject, body);
                await smtp.SendMailAsync(mail, ct);
                _logger.LogInformation("Sent {Count} task reminders via SMTP", dueTasks.Count);
            }
            else
            {
                _logger.LogInformation(
                    "Email not configured. Would notify {Email} about {Count} due tasks:\n{Body}",
                    user.Email, dueTasks.Count, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send task reminder emails");
        }
    }
}
