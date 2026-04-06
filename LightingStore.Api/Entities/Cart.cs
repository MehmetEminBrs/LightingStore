namespace LightingStore.Api.Entities;

public class Cart
{
    public int CartId { get; set; }
    public int UserId { get; set; }


    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public User User { get; set; }
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
