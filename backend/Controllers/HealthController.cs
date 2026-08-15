using Apex.Api.DTOs;
using Apex.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Apex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly HealthService _healthService;

    public HealthController(HealthService healthService) => _healthService = healthService;

    [HttpPost("webhook")]
    public async Task<ActionResult<HealthLogDto>> Webhook([FromBody] HealthWebhookRequest request)
    {
        if (!DateOnly.TryParse(request.Date, out _))
            return BadRequest("Invalid date format. Use YYYY-MM-DD.");

        var result = await _healthService.UpsertAsync(request);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<HealthLogDto>>> GetRecent([FromQuery] int days = 30)
    {
        var logs = await _healthService.GetRecentAsync(days);
        return Ok(logs);
    }
}
