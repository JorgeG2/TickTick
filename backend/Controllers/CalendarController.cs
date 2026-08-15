using Apex.Api.DTOs;
using Apex.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Apex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarController : ControllerBase
{
    private readonly CalendarService _calendarService;

    public CalendarController(CalendarService calendarService) => _calendarService = calendarService;

    [HttpGet("{date}")]
    public async Task<ActionResult<CalendarEntryDto>> GetByDate(string date)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return BadRequest("Invalid date format. Use YYYY-MM-DD.");

        var entry = await _calendarService.GetByDateAsync(parsedDate);
        return Ok(entry);
    }

    [HttpPut("{date}")]
    public async Task<ActionResult<CalendarEntryDto>> Upsert(string date, [FromBody] UpdateCalendarRequest request)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return BadRequest("Invalid date format. Use YYYY-MM-DD.");

        var entry = await _calendarService.UpsertAsync(parsedDate, request);
        return Ok(entry);
    }
}
