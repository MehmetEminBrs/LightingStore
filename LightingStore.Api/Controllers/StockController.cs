using LightingStore.Api.Data;
using LightingStore.Api.DTOs.Product;
using LightingStore.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using LightingStore.Api.Services.Interfaces;


[ApiController]
[Route("api/stocks")]
public class StockController : ControllerBase
{
    private readonly IStockService _stockService;

    public StockController(IStockService stockService)
    {
        _stockService = stockService;
    }

    [HttpGet("{productId}")]
    public async Task<IActionResult> GetStock(int productId)
    {
        var stock = await _stockService.GetStockAsync(productId);

        if (stock == null)
            return NotFound("Stok bulunamadı");

        return Ok(stock);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllStocks()
    {
        var stocks = await _stockService.GetAllStocksAsync();
        return Ok(stocks);
    }


    
    [Authorize(Roles = "Admin")]
    [HttpPost("{productId}/add")]
    public async Task<IActionResult> AddStock(int productId, [FromQuery] int quantity)
    {
        await _stockService.AddStockAsync(productId, quantity);
        return Ok("Stok eklendi");
    }

    [Authorize]
    [HttpPost("{productId}/decrease")]
    public async Task<IActionResult> DecreaseStock(int productId, [FromQuery] int quantity)
    {
        await _stockService.RemoveStockAsync(productId, quantity, "Order");
        return Ok("Stok düşüldü");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{productId}")]
    public async Task<IActionResult> UpdateStock(int productId, [FromQuery] int quantity)
    {
        await _stockService.UpdateStockAsync(productId, quantity);
        return Ok("Stok güncellendi");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{productId}")]
    public async Task<IActionResult> DeleteStock(int productId)
    {
        await _stockService.DeleteStockAsync(productId);
        return Ok("Stok silindi");
    }

    
}
