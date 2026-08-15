namespace Apex.Api.Models;

public class CalendarEntry
{
    public Guid Id { get; set; }
    public DateOnly EntryDate { get; set; }
    public string? BlockNoteJson { get; set; }
    public string? ExcalidrawJson { get; set; }
}
