using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Thaat.Api.Models;

/// <summary>
/// Review entity - customer testimonials
/// </summary>
public class Review
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("location")]
    public string Location { get; set; } = string.Empty;

    [BsonElement("rating")]
    public int Rating { get; set; } = 5;

    [BsonElement("text")]
    public string Text { get; set; } = string.Empty;

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
