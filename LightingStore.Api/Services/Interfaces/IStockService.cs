using LightingStore.Api.DTOs.ProductStock;


namespace LightingStore.Api.Services.Interfaces;


public interface IStockService
{
    Task AddStockAsync(int productId, int quantity);
    Task RemoveStockAsync(int productId, int quantity, string changeType);
    Task UpdateStockAsync(int productId, int newQuantity);
    Task DeleteStockAsync(int productId);
    
    Task<StockListDto?> GetStockAsync(int productId);
    Task<List<StockListDto>> GetAllStocksAsync();

}
