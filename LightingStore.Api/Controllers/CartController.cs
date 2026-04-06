using LightingStore.Api.Data;
using LightingStore.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly LightingStoreDbContext _context;

    public CartController(LightingStoreDbContext context)
    {
        _context = context;
    }

   [HttpPost("add")]
public async Task<IActionResult> AddToCart(int productId, int quantity = 1)
{
    if (quantity <= 0)
        return BadRequest("Quantity 1'den küçük olamaz");

    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var product = await _context.Products.FindAsync(productId);
    if (product == null)
        return NotFound("Ürün bulunamadı");

    var stock = await _context.ProductStocks
        .FirstOrDefaultAsync(s => s.ProductId == productId);

    if (stock == null || stock.Quantity <= 0)
        return BadRequest("Ürün stokta yok");

    var cart = await _context.Carts
        .Include(c => c.CartItems)
        .FirstOrDefaultAsync(c => c.UserId == userId);

    if (cart == null)
    {
        cart = new Cart
        {
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();
    }

    var existingItem = cart.CartItems
        .FirstOrDefault(ci => ci.ProductId == productId);

    var currentCartQuantity = existingItem?.Quantity ?? 0;
    var newTotalQuantity = currentCartQuantity + quantity;

    if (newTotalQuantity > stock.Quantity)
        return BadRequest($"Stokta yalnızca {stock.Quantity} adet bulunmaktadır");

    if (existingItem != null)
    {
        existingItem.Quantity = newTotalQuantity;
    }
    else
    {
        cart.CartItems.Add(new CartItem
        {
            ProductId = productId,
            Quantity = quantity
        });
    }

    cart.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return Ok("Ürün sepete eklendi");
}
    [HttpGet]
public async Task<IActionResult> GetMyCart()
{
    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var cart = await _context.Carts
        .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
                .ThenInclude(p => p.ProductImages)
        .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
                .ThenInclude(p => p.Category)
        .FirstOrDefaultAsync(c => c.UserId == userId);

    if (cart == null || !cart.CartItems.Any())
        return Ok(new { message = "Sepet boş" });

    var result = cart.CartItems.Select(ci => new
    {
        ci.ProductId,
        ProductName = ci.Product.ProductName,
        Slug = ci.Product.Slug,
        MainImageUrl = ci.Product.ProductImages
            .Where(i => i.IsMain)
            .Select(i => i.ImageUrl)
            .FirstOrDefault(),
        CategoryName = ci.Product.Category.CategoryName,
        ci.Quantity,
        Price = ci.Product.Price,
        DiscountPrice = ci.Product.DiscountPrice,
        Total = ci.Quantity * (ci.Product.DiscountPrice ?? ci.Product.Price)
    });

    return Ok(result);
}

    [HttpDelete("remove/{productId}")]
    public async Task<IActionResult> RemoveFromCart(int productId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
            return NotFound("Sepet bulunamadı");

        var item = cart.CartItems
            .FirstOrDefault(ci => ci.ProductId == productId);

        if (item == null)
            return NotFound("Ürün sepette yok");

        cart.CartItems.Remove(item);

        await _context.SaveChangesAsync();

        return Ok("Ürün sepetten çıkarıldı");
    }
}