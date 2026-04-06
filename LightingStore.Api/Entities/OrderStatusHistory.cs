namespace LightingStore.Api.Entities
{
    public class OrderStatusHistory
    {
        public int OrderStatusHistoryId { get; set; }

        public int OrderId { get; set; }

        public string? OldStatus { get; set; }
        public string NewStatus { get; set; } = null!;

        public DateTime ChangedAt { get; set; }

        public Order Order { get; set; } = null!;
    }
}
