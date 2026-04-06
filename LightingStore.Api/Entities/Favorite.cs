namespace LightingStore.Api.Entities;

public class Favorite
{
    public int FavoriteId { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}