namespace LightingStore.Api.Entities;

public class Category
{
    public int CategoryId { get; set; }   

    public string CategoryName { get; set; }
    public string Slug { get; set; }
    public bool IsActive { get; set; }

    public string? ImageUrl { get; set; }

    public ICollection<Product> Products { get; set; }
}
