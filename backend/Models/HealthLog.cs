namespace Apex.Api.Models;

public class HealthLog
{
    public Guid Id { get; set; }
    public DateOnly LogDate { get; set; }
    public int StepCount { get; set; } = 0;
    public decimal SleepHours { get; set; } = 0;
    public decimal WeightLbs { get; set; } = 0;
}
