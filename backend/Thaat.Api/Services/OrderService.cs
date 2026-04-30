using MongoDB.Driver;
using Thaat.Api.Data;
using Thaat.Api.Models;

namespace Thaat.Api.Services;

/// <summary>
/// Service for Order management
/// </summary>
public interface IOrderService
{
    Task<List<Order>> GetAllAsync();
    Task<List<Order>> GetByStatusAsync(string status);
    Task<Order?> GetByIdAsync(string id);
    Task<Order> CreateAsync(Order order);
    Task<bool> UpdateStatusAsync(string id, string status);
    Task<int> GetTotalRevenueAsync();
}

public class OrderService : IOrderService
{
    private readonly MongoDbContext _db;

    public OrderService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<List<Order>> GetAllAsync()
    {
        return await _db.Orders
            .Find(_ => true)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Order>> GetByStatusAsync(string status)
    {
        return await _db.Orders
            .Find(o => o.Status == status)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order?> GetByIdAsync(string id)
    {
        return await _db.Orders
            .Find(o => o.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<Order> CreateAsync(Order order)
    {
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;
        order.Status = string.IsNullOrEmpty(order.Status) ? "Pending" : order.Status;
        await _db.Orders.InsertOneAsync(order);
        return order;
    }

    public async Task<bool> UpdateStatusAsync(string id, string status)
    {
        var update = Builders<Order>.Update
            .Set(o => o.Status, status)
            .Set(o => o.UpdatedAt, DateTime.UtcNow);

        var result = await _db.Orders.UpdateOneAsync(
            o => o.Id == id, update);

        return result.ModifiedCount > 0;
    }

    public async Task<int> GetTotalRevenueAsync()
    {
        var orders = await _db.Orders
            .Find(o => o.Status != "Cancelled")
            .ToListAsync();

        return orders.Sum(o => o.Total);
    }
}
