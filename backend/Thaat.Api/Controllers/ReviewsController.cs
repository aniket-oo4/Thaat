using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Thaat.Api.Models;
using Thaat.Api.Services;

namespace Thaat.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    /// <summary>
    /// Get all active reviews (public - for storefront)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reviews = await _reviewService.GetActiveAsync();
        return Ok(reviews);
    }

    /// <summary>
    /// Get all reviews including inactive (admin only)
    /// </summary>
    [HttpGet("all")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetAllAdmin()
    {
        var reviews = await _reviewService.GetAllAsync();
        return Ok(reviews);
    }

    /// <summary>
    /// Create a new review (admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] Review review)
    {
        var created = await _reviewService.CreateAsync(review);
        return CreatedAtAction(nameof(GetAllAdmin), created);
    }

    /// <summary>
    /// Update a review (admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Update(string id, [FromBody] Review review)
    {
        var updated = await _reviewService.UpdateAsync(id, review);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    /// <summary>
    /// Delete a review (admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _reviewService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
