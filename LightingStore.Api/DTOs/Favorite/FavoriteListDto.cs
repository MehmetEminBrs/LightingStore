namespace LightingStore.Api.DTOs.Favorite;

public class FavoriteListDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public string ProductImage { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }

    public string Slug { get; set; }
}