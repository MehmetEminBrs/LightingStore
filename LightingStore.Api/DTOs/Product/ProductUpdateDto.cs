namespace LightingStore.Api.DTOs.Product;

public class ProductUpdateDto
{
    public string ProductName { get; set; }
    public string Slug { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public bool IsPopular { get; set; }
    public int? PopularOrder { get; set; }
    public int CategoryId { get; set; }

    public List<IFormFile>? NewImages { get; set; }

    public List<int>? DeleteImageIds { get; set; }

    public int? MainImageId { get; set; }

    public Dictionary<int, IFormFile>? ReplaceImages { get; set; }

    public bool IsNew { get; set; }

}
