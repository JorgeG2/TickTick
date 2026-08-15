using System.Text;
using Apex.Api.Data;
using Apex.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Controllers;

[ApiController]
[Route("api/e-ink")]
public class EInkController : ControllerBase
{
    private readonly TaskService _taskService;
    private readonly ApexDbContext _db;

    public EInkController(TaskService taskService, ApexDbContext db)
    {
        _taskService = taskService;
        _db = db;
    }

    [HttpGet("today")]
    [Produces("text/html")]
    public async Task<ContentResult> Today()
    {
        var tasks = await _taskService.GetTodayPendingAsync();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var calendar = await _db.CalendarEntries
            .FirstOrDefaultAsync(e => e.EntryDate == today);

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html><head>");
        sb.AppendLine("<meta charset=\"utf-8\">");
        sb.AppendLine("<meta http-equiv=\"refresh\" content=\"900\">");
        sb.AppendLine("<title>Apex Today</title>");
        sb.AppendLine("<style>");
        sb.AppendLine("body { font-family: 'Courier New', monospace; background: #fff; color: #000; margin: 20px; }");
        sb.AppendLine("h1 { font-size: 24px; border-bottom: 3px solid #000; padding-bottom: 8px; }");
        sb.AppendLine("h2 { font-size: 18px; margin-top: 24px; }");
        sb.AppendLine("ul { list-style: square; padding-left: 24px; }");
        sb.AppendLine("li { font-size: 16px; margin: 8px 0; }");
        sb.AppendLine("button { font-size: 16px; padding: 8px 16px; border: 2px solid #000; background: #fff; cursor: pointer; margin-bottom: 16px; }");
        sb.AppendLine(".meta { font-size: 12px; color: #333; }");
        sb.AppendLine(".empty { font-style: italic; }");
        sb.AppendLine("</style>");
        sb.AppendLine("</head><body>");
        sb.AppendLine("<button onclick=\"window.location.reload()\">Refresh</button>");
        sb.AppendLine($"<h1>Apex — {today:MMMM d, yyyy}</h1>");

        sb.AppendLine("<h2>Today's Tasks</h2>");
        if (tasks.Count == 0)
        {
            sb.AppendLine("<p class=\"empty\">No pending tasks for today.</p>");
        }
        else
        {
            sb.AppendLine("<ul>");
            foreach (var task in tasks)
            {
                var priority = task.Priority switch
                {
                    Models.PriorityLevel.Day => "DAY",
                    Models.PriorityLevel.Week => "WEEK",
                    _ => "MONTH"
                };
                sb.AppendLine($"<li><strong>[{priority}]</strong> {System.Net.WebUtility.HtmlEncode(task.Title)}</li>");
            }
            sb.AppendLine("</ul>");
        }

        sb.AppendLine("<h2>Calendar Notes</h2>");
        if (calendar?.BlockNoteJson is not null)
        {
            sb.AppendLine("<p class=\"meta\">Notes saved for today.</p>");
        }
        else
        {
            sb.AppendLine("<p class=\"empty\">No notes for today.</p>");
        }

        sb.AppendLine($"<p class=\"meta\">Last updated: {DateTime.UtcNow:HH:mm} UTC</p>");
        sb.AppendLine("</body></html>");

        return Content(sb.ToString(), "text/html", Encoding.UTF8);
    }
}
