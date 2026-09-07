using Apex.Api.Data;
using Apex.Api.DTOs;
using Apex.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Apex.Api.Controllers;

[ApiController]
[Route("api/brain-map")]
public class BrainMapController : ControllerBase
{
    private readonly ApexDbContext _db;

    public BrainMapController(ApexDbContext db) => _db = db;

    /// <summary>The brain map is a single shared canvas: the first row is the row.</summary>
    private async Task<BrainMap> GetOrCreateAsync()
    {
        var map = await _db.BrainMaps.FirstOrDefaultAsync();
        if (map is null)
        {
            map = new BrainMap { Id = Guid.NewGuid(), UpdatedAt = DateTimeOffset.UtcNow };
            _db.BrainMaps.Add(map);
            await _db.SaveChangesAsync();
        }
        return map;
    }

    [HttpGet]
    public async Task<ActionResult<BrainMapDto>> Get()
    {
        var map = await GetOrCreateAsync();
        return Ok(new BrainMapDto(map.Id, map.ExcalidrawJson, map.UpdatedAt));
    }

    [HttpPut]
    public async Task<ActionResult<BrainMapDto>> Update([FromBody] UpdateBrainMapRequest request)
    {
        var map = await GetOrCreateAsync();
        map.ExcalidrawJson = request.ExcalidrawJson;
        map.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new BrainMapDto(map.Id, map.ExcalidrawJson, map.UpdatedAt));
    }
}
