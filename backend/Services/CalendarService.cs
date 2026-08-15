using Apex.Api.Data;
using Apex.Api.DTOs;
using Apex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Services;

public class CalendarService
{
    private readonly ApexDbContext _db;

    public CalendarService(ApexDbContext db) => _db = db;

    public async Task<CalendarEntryDto> GetByDateAsync(DateOnly date)
    {
        var entry = await _db.CalendarEntries
            .FirstOrDefaultAsync(e => e.EntryDate == date);

        if (entry is null)
        {
            return new CalendarEntryDto(null, date.ToString("yyyy-MM-dd"), null, null);
        }

        return new CalendarEntryDto(
            entry.Id,
            entry.EntryDate.ToString("yyyy-MM-dd"),
            entry.BlockNoteJson,
            entry.ExcalidrawJson
        );
    }

    public async Task<CalendarEntryDto> UpsertAsync(DateOnly date, UpdateCalendarRequest request)
    {
        var entry = await _db.CalendarEntries
            .FirstOrDefaultAsync(e => e.EntryDate == date);

        if (entry is null)
        {
            entry = new CalendarEntry
            {
                Id = Guid.NewGuid(),
                EntryDate = date
            };
            _db.CalendarEntries.Add(entry);
        }

        if (request.BlockNoteJson is not null)
            entry.BlockNoteJson = request.BlockNoteJson;

        if (request.ExcalidrawJson is not null)
            entry.ExcalidrawJson = request.ExcalidrawJson;

        await _db.SaveChangesAsync();

        return new CalendarEntryDto(
            entry.Id,
            entry.EntryDate.ToString("yyyy-MM-dd"),
            entry.BlockNoteJson,
            entry.ExcalidrawJson
        );
    }
}
