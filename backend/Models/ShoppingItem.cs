namespace Apex.Api.Models;

public class ShoppingItem
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public decimal EstimatedPrice { get; set; }
    public bool IsPurchased { get; set; } = false;
}
