using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Thaat.Api.Models;
using Thaat.Api.Services;

namespace Thaat.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Get all orders (admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] string? status = null)
    {
        var orders = string.IsNullOrEmpty(status)
            ? await _orderService.GetAllAsync()
            : await _orderService.GetByStatusAsync(status);
        return Ok(orders);
    }

    /// <summary>
    /// Get order by ID (admin only)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetById(string id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    /// <summary>
    /// Get total revenue (admin only)
    /// </summary>
    [HttpGet("revenue")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetRevenue()
    {
        var revenue = await _orderService.GetTotalRevenueAsync();
        return Ok(new { total = revenue });
    }

    /// <summary>
    /// Create a new order (public - from storefront cart checkout)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Order order)
    {
        order.Status = "Pending";
        order.Source = "WhatsApp";
        var created = await _orderService.CreateAsync(order);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update order status (admin only)
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusRequest request)
    {
        var updated = await _orderService.UpdateStatusAsync(id, request.Status);
        if (!updated) return NotFound();
        return Ok(new { success = true, status = request.Status });
    }
}
