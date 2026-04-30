using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Thaat.Api.Models;

/// <summary>
/// Product entity - represents a clothing item in the store
/// </summary>
public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("category")]
    public string Category { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("price")]
    public int Price { get; set; }

    [BsonElement("originalPrice")]
    public int OriginalPrice { get; set; }

    [BsonElement("sizes")]
    public List<string> Sizes { get; set; } = new();

    [BsonElement("badge")]
    public string Badge { get; set; } = string.Empty;

    [BsonElement("image")]
    public string Image { get; set; } = string.Empty; // Base64 encoded

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
