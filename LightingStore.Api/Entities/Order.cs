namespace LightingStore.Api.Entities;
public class Order
{
    public int OrderId { get; set; }
    public int UserId { get; set; }

    public string OrderStatus { get; set; }
    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; }

    public User User { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; }
}
