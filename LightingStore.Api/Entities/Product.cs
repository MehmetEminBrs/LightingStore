namespace LightingStore.Api.Entities;

public class Product
{
    public int ProductId { get; set; }

    public int CategoryId { get; set; }
    public string ProductName { get; set; }
    public string Slug { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }

    public decimal? DiscountPrice { get; set; }

    public bool IsPopular { get; set; }
    public int? PopularOrder { get; set; }

    public bool IsNew { get; set; }

    public bool IsActive { get; set; }

    public Category Category { get; set; }

    public ProductStock ProductStock { get; set; }
    public ICollection<ProductImage> ProductImages { get; set; }
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Favorite> Favorites { get; set; }
}
