using MongoDB.Driver;
using Thaat.Api.Models;

namespace Thaat.Api.Data;

/// <summary>
/// MongoDB database context - provides typed collection access
/// Loosely coupled: each collection is independent
/// </summary>
public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration["MongoDb:ConnectionString"]
            ?? throw new InvalidOperationException("MongoDB connection string not configured");
        var databaseName = configuration["MongoDb:DatabaseName"] ?? "thaat_db";

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);

        // Create indexes for performance
        CreateIndexes();
    }

    public IMongoCollection<Product> Products => _database.GetCollection<Product>("products");
    public IMongoCollection<Order> Orders => _database.GetCollection<Order>("orders");
    public IMongoCollection<Review> Reviews => _database.GetCollection<Review>("reviews");
    public IMongoCollection<AdminUser> AdminUsers => _database.GetCollection<AdminUser>("admin_users");

    private void CreateIndexes()
    {
        // Product indexes
        Products.Indexes.CreateOneAsync(new CreateIndexModel<Product>(
            Builders<Product>.IndexKeys.Ascending(p => p.Category)));

        Products.Indexes.CreateOneAsync(new CreateIndexModel<Product>(
            Builders<Product>.IndexKeys.Ascending(p => p.IsActive)));

        // Order indexes
        Orders.Indexes.CreateOneAsync(new CreateIndexModel<Order>(
            Builders<Order>.IndexKeys.Descending(o => o.CreatedAt)));

        Orders.Indexes.CreateOneAsync(new CreateIndexModel<Order>(
            Builders<Order>.IndexKeys.Ascending(o => o.Status)));

        // Admin user unique index
        AdminUsers.Indexes.CreateOneAsync(new CreateIndexModel<AdminUser>(
            Builders<AdminUser>.IndexKeys.Ascending(u => u.Username),
            new CreateIndexOptions { Unique = true }));
    }
}
