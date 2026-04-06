namespace LightingStore.Api.Entities;
public class StockHistory
{
    public int StockHistoryId { get; set; }
    public int ProductId { get; set; }

    public string ChangeType { get; set; }
    public int OldQuantity { get; set; }
    public int NewQuantity { get; set; }

    public DateTime ChangedAt { get; set; }

    public Product Product { get; set; }
}
