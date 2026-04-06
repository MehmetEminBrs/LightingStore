using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LightingStore.Api.Data;
using LightingStore.Api.Entities;

namespace LightingStore.Api.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly LightingStoreDbContext _context;

        public OrdersController(LightingStoreDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder(int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || !cart.CartItems.Any())
                    return BadRequest("Sepet boş");

                var order = new Order
                {
                    UserId = userId,
                    OrderStatus = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    OrderItems = new List<OrderItem>()
                };

                decimal total = 0;

                foreach (var item in cart.CartItems)
                {
                    var stock = await _context.ProductStocks
                        .FirstOrDefaultAsync(s => s.ProductId == item.ProductId);

                    if (stock == null)
                        throw new Exception("Stok bilgisi bulunamadı");

                    if (stock.Quantity < item.Quantity)
                        throw new Exception($"{item.Product.ProductName} stok yetersiz");

                    int oldQty = stock.Quantity;
                    stock.Quantity -= item.Quantity;

                    _context.StockHistories.Add(new StockHistory
                    {
                        ProductId = item.ProductId,
                        ChangeType = "Order",
                        OldQuantity = oldQty,
                        NewQuantity = stock.Quantity,
                        ChangedAt = DateTime.UtcNow
                    });

                    order.OrderItems.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = item.Product.Price
                    });

                    total += item.Quantity * item.Product.Price;
                }

                order.TotalAmount = total;

                _context.Orders.Add(order);

                _context.OrderStatusHistories.Add(new OrderStatusHistory
                {
                    Order = order,
                    OldStatus = null,
                    NewStatus = "Pending",
                    ChangedAt = DateTime.UtcNow
                });

                _context.CartItems.RemoveRange(cart.CartItems);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Sipariş başarıyla oluşturuldu",
                    orderTotal = total
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new
                {
                    error = ex.Message
                });
            }
        }
    }
}
