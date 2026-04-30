using MongoDB.Driver;
using Thaat.Api.Data;
using Thaat.Api.Models;

namespace Thaat.Api.Services;

/// <summary>
/// Service for Product CRUD operations
/// </summary>
public interface IProductService
{
    Task<List<Product>> GetAllAsync();
    Task<List<Product>> GetActiveAsync();
    Task<Product?> GetByIdAsync(string id);
    Task<Product> CreateAsync(Product product);
    Task<Product?> UpdateAsync(string id, Product product);
    Task<bool> DeleteAsync(string id);
}

public class ProductService : IProductService
{
    private readonly MongoDbContext _db;

    public ProductService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<List<Product>> GetAllAsync()
    {
        return await _db.Products
            .Find(_ => true)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Product>> GetActiveAsync()
    {
        return await _db.Products
            .Find(p => p.IsActive)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(string id)
    {
        return await _db.Products
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<Product> CreateAsync(Product product)
    {
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.Products.InsertOneAsync(product);
        return product;
    }

    public async Task<Product?> UpdateAsync(string id, Product product)
    {
        product.Id = id;
        product.UpdatedAt = DateTime.UtcNow;

        var result = await _db.Products.ReplaceOneAsync(
            p => p.Id == id, product);

        return result.ModifiedCount > 0 ? product : null;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _db.Products.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0;
    }
}
