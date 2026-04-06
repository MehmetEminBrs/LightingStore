namespace LightingStore.Api.Dtos.ProductImage;

public class ProductImageCreateDto
{
    public int ProductId { get; set; }
    public List<IFormFile> Files { get; set; } = new();
    public bool IsMain { get; set; }
}
