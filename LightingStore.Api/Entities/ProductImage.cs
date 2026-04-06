namespace LightingStore.Api.Entities;
public class ProductImage
{
    public int ImageId { get; set; }
    public int ProductId { get; set; }

    public string ImageUrl { get; set; }
    public bool IsMain { get; set; }

    public Product Product { get; set; }
}
