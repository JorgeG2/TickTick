namespace Apex.Api.Models;

/// <summary>
/// The single central canvas. Unlike calendar entries there is only ever one
/// row, so it is addressed as a singleton rather than by id.
/// </summary>
public class BrainMap
{
    public Guid Id { get; set; }
    public string? ExcalidrawJson { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
