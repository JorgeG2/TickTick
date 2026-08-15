using Apex.Api.Data;
using Apex.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApexDbContext _db;

    public CategoriesController(ApexDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        var categories = await _db.Categories
            .Select(c => new CategoryDto(c.Id, c.Name, c.ColorHex))
            .ToListAsync();
        return Ok(categories);
    }
}

[ApiController]
[Route("api/[controller]")]
public class ShoppingController : ControllerBase
{
    private readonly ApexDbContext _db;

    public ShoppingController(ApexDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<ShoppingItemDto>>> GetAll()
    {
        var items = await _db.ShoppingItems
            .OrderBy(s => s.IsPurchased)
            .ThenBy(s => s.Name)
            .Select(s => new ShoppingItemDto(s.Id, s.Name, s.EstimatedPrice, s.IsPurchased))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<ShoppingItemDto>> Create([FromBody] ShoppingItemDto request)
    {
        var item = new Models.ShoppingItem
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            EstimatedPrice = request.EstimatedPrice
        };
        _db.ShoppingItems.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new ShoppingItemDto(item.Id, item.Name, item.EstimatedPrice, item.IsPurchased));
    }

    [HttpPut("{id:guid}/toggle")]
    public async Task<ActionResult<ShoppingItemDto>> Toggle(Guid id)
    {
        var item = await _db.ShoppingItems.FindAsync(id);
        if (item is null) return NotFound();
        item.IsPurchased = !item.IsPurchased;
        await _db.SaveChangesAsync();
        return Ok(new ShoppingItemDto(item.Id, item.Name, item.EstimatedPrice, item.IsPurchased));
    }
}

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ApexDbContext _db;

    public UserController(ApexDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<UserAccountDto>> GetCurrent()
    {
        var user = await _db.UserAccounts.FirstOrDefaultAsync();
        if (user is null) return NotFound();

        user.LastLoginDate = DateTimeOffset.UtcNow;
        user.CurrentStreak += 1;
        await _db.SaveChangesAsync();

        return Ok(new UserAccountDto(user.Id, user.Email, user.CurrentStreak, user.LastLoginDate));
    }
}
