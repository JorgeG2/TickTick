using Apex.Api.DTOs;
using Apex.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Apex.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly AiStudyPlannerService _plannerService;

    public AiController(AiStudyPlannerService plannerService) => _plannerService = plannerService;

    [HttpPost("generate-plan")]
    public async Task<ActionResult<GeneratePlanResponse>> GeneratePlan([FromBody] GeneratePlanRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Goal))
            return BadRequest("Goal is required.");

        if (!DateOnly.TryParse(request.TimelineDate, out _))
            return BadRequest("Invalid timelineDate format. Use YYYY-MM-DD.");

        var result = await _plannerService.GeneratePlanAsync(request);
        return Ok(result);
    }
}
