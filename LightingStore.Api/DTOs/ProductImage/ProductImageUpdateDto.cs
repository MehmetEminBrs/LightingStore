namespace LightingStore.Api.Dtos.ProductImage;

public class ProductImageUpdateDto
{
    public int ImageId { get; set; }
    public IFormFile? File { get; set; }
    public bool IsMain { get; set; }
}
