namespace LightingStore.Api.DTOs.Product;

public class ProductListDto
{
    public int ProductId { get; set; }
    public int CategoryId { get; set; }

    public string ProductName { get; set; }
    public string Slug { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }

    public bool IsPopular { get; set; }
    public int? PopularOrder { get; set; }

    public string CategoryName { get; set; }
    public string MainImageUrl { get; set; }
    public int? Quantity { get; set; }

    public bool IsNew { get; set; }
    public bool IsFavorite { get; set; }

}
