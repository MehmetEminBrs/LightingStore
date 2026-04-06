namespace LightingStore.Api.Entities;
public class ProductStock
{
    public int StockId { get; set; }
    public int ProductId { get; set; }

    public int Quantity { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Product Product { get; set; }
}
