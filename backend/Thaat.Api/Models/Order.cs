using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Thaat.Api.Models;

/// <summary>
/// Order entity - stores customer order data
/// </summary>
public class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("items")]
    public List<OrderItem> Items { get; set; } = new();

    [BsonElement("subtotal")]
    public int Subtotal { get; set; }

    [BsonElement("deliveryCharge")]
    public int DeliveryCharge { get; set; }

    [BsonElement("total")]
    public int Total { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "Pending";

    [BsonElement("source")]
    public string Source { get; set; } = "WhatsApp";

    [BsonElement("customerName")]
    public string CustomerName { get; set; } = string.Empty;

    [BsonElement("customerPhone")]
    public string CustomerPhone { get; set; } = string.Empty;

    [BsonElement("notes")]
    public string Notes { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Individual item within an order
/// </summary>
public class OrderItem
{
    [BsonElement("productId")]
    public string ProductId { get; set; } = string.Empty;

    [BsonElement("productName")]
    public string ProductName { get; set; } = string.Empty;

    [BsonElement("size")]
    public string Size { get; set; } = string.Empty;

    [BsonElement("quantity")]
    public int Quantity { get; set; } = 1;

    [BsonElement("unitPrice")]
    public int UnitPrice { get; set; }
}
