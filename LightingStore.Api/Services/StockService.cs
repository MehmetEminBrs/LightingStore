using LightingStore.Api.Data;
using LightingStore.Api.Entities;
using LightingStore.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using LightingStore.Api.DTOs.ProductStock;

namespace LightingStore.Api.Services;

public class StockService : IStockService
{
    private readonly LightingStoreDbContext _context;

    public StockService(LightingStoreDbContext context)
    {
        _context = context;
    }

    public async Task AddStockAsync(int productId, int quantity)
    {
        var stock = await _context.ProductStocks
            .FirstOrDefaultAsync(x => x.ProductId == productId);

        if (stock == null)
        {
            stock = new ProductStock
            {
                ProductId = productId,
                Quantity = quantity,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ProductStocks.Add(stock);
        }
        else
        {
            int old = stock.Quantity;
            stock.Quantity += quantity;
            stock.UpdatedAt = DateTime.UtcNow;

            await AddHistory(productId, "Manual", old, stock.Quantity);
        }

        await _context.SaveChangesAsync();
    }

    public async Task RemoveStockAsync(int productId, int quantity, string changeType)
    {
        var stock = await _context.ProductStocks
            .FirstOrDefaultAsync(x => x.ProductId == productId);

        if (stock == null || stock.Quantity < quantity)
            throw new Exception("Yeterli stok yok");

        int old = stock.Quantity;
        stock.Quantity -= quantity;
        stock.UpdatedAt = DateTime.UtcNow;

        await AddHistory(productId, changeType, old, stock.Quantity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateStockAsync(int productId, int newQuantity)
    {
        var stock = await _context.ProductStocks
            .FirstOrDefaultAsync(x => x.ProductId == productId);

        if (stock == null)
            throw new Exception("Stok bulunamadı");

        int old = stock.Quantity;
        stock.Quantity = newQuantity;
        stock.UpdatedAt = DateTime.UtcNow;

        await AddHistory(productId, "ManualUpdate", old, newQuantity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteStockAsync(int productId)
    {
        var stock = await _context.ProductStocks
            .FirstOrDefaultAsync(x => x.ProductId == productId);

        if (stock != null)
            _context.ProductStocks.Remove(stock);

        await _context.SaveChangesAsync();
    }

    private async Task AddHistory(int productId, string type, int oldQ, int newQ)
    {
        _context.StockHistories.Add(new StockHistory
        {
            ProductId = productId,
            ChangeType = type,
            OldQuantity = oldQ,
            NewQuantity = newQ,
            ChangedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

        public async Task<StockListDto?> GetStockAsync(int productId)
        {
            var stock = await _context.ProductStocks
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.ProductId == productId);

            if (stock == null)
                return null;

            return new StockListDto
            {
                ProductId = stock.ProductId,
                Quantity = stock.Quantity,
                IsOutOfStock = stock.Quantity == 0,
                IsLowStock = stock.Quantity > 0 && stock.Quantity <= 5
            };
        }

       public async Task<List<StockListDto>> GetAllStocksAsync()
{
    return await _context.ProductStocks
        .AsNoTracking()
        .Select(stock => new StockListDto
        {
            ProductId = stock.ProductId,
            Quantity = stock.Quantity,
            IsOutOfStock = stock.Quantity == 0,
            IsLowStock = stock.Quantity > 0 && stock.Quantity <= 5
        })
        .ToListAsync();
}


}

