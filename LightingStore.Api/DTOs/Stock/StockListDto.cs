namespace LightingStore.Api.DTOs.ProductStock;

public class StockListDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public bool IsOutOfStock { get; set; }
    public bool IsLowStock { get; set; }
}
