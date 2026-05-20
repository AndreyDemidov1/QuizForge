using Microsoft.AspNetCore.Mvc;
using TestManager.Api.DTOs;
using TestManager.Api.Services;

namespace TestManager.Api.Controllers;

[ApiController]
[Route("api/tests")]
public class TestsController(ITestService testService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TestListItemDto>>> GetAll(CancellationToken cancellationToken)
    {
        var tests = await testService.GetAllAsync(cancellationToken);
        return Ok(tests);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TestDetailDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var test = await testService.GetByIdAsync(id, cancellationToken);
        return test is null ? NotFound() : Ok(test);
    }

    [HttpGet("{id:guid}/quiz")]
    public async Task<ActionResult<TestForQuizDto>> GetForQuiz(Guid id, CancellationToken cancellationToken)
    {
        var test = await testService.GetForQuizAsync(id, cancellationToken);
        return test is null ? NotFound() : Ok(test);
    }

    [HttpPost]
    public async Task<ActionResult<TestDetailDto>> Create([FromBody] CreateTestDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var created = await testService.CreateAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TestDetailDto>> Update(Guid id, [FromBody] UpdateTestDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await testService.UpdateAsync(id, dto, cancellationToken);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await testService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<AttemptResultDto>> Submit(
        Guid id,
        [FromBody] SubmitAttemptDto dto,
        CancellationToken cancellationToken)
    {
        var result = await testService.SubmitAttemptAsync(id, dto, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
