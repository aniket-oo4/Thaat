using MongoDB.Driver;
using Thaat.Api.Data;
using Thaat.Api.Models;

namespace Thaat.Api.Services;

/// <summary>
/// Service for Review management
/// </summary>
public interface IReviewService
{
    Task<List<Review>> GetAllAsync();
    Task<List<Review>> GetActiveAsync();
    Task<Review> CreateAsync(Review review);
    Task<Review?> UpdateAsync(string id, Review review);
    Task<bool> DeleteAsync(string id);
}

public class ReviewService : IReviewService
{
    private readonly MongoDbContext _db;

    public ReviewService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<List<Review>> GetAllAsync()
    {
        return await _db.Reviews
            .Find(_ => true)
            .SortByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Review>> GetActiveAsync()
    {
        return await _db.Reviews
            .Find(r => r.IsActive)
            .SortByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Review> CreateAsync(Review review)
    {
        review.CreatedAt = DateTime.UtcNow;
        await _db.Reviews.InsertOneAsync(review);
        return review;
    }

    public async Task<Review?> UpdateAsync(string id, Review review)
    {
        review.Id = id;
        var result = await _db.Reviews.ReplaceOneAsync(
            r => r.Id == id, review);
        return result.ModifiedCount > 0 ? review : null;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _db.Reviews.DeleteOneAsync(r => r.Id == id);
        return result.DeletedCount > 0;
    }
}
