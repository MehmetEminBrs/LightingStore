namespace LightingStore.Api.DTOs.Product;

public class ProductDetailDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public string Slug { get; set; }
    public string Description { get; set; }

    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }

    public bool IsPopular { get; set; }
    public int? PopularOrder { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; }

    public List<string> Images { get; set; }

    public bool IsNew { get; set; }

}
