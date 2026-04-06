using LightingStore.Api.Data;
using LightingStore.Api.DTOs.Favorite;
using LightingStore.Api.Entities;
using LightingStore.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LightingStore.Api.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly LightingStoreDbContext _context;

        public FavoriteService(LightingStoreDbContext context)
        {
            _context = context;
        }

        public async Task ToggleFavoriteAsync(int userId, int productId)
        {
            var existingFavorite = await _context.Favorites
                .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId);

            if (existingFavorite != null)
            {
                _context.Favorites.Remove(existingFavorite);
            }
            else
            {
                var favorite = new Favorite
                {
                    UserId = userId,
                    ProductId = productId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Favorites.Add(favorite);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<FavoriteListDto>> GetUserFavoritesAsync(int userId)
        {
            return await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => new FavoriteListDto
                {
                    ProductId = f.Product.ProductId,
                    ProductName = f.Product.ProductName,
                    Price = f.Product.Price,
                    DiscountPrice = f.Product.DiscountPrice,
                    Slug = f.Product.Slug,
                    

                    ProductImage = f.Product.ProductImages
                        .OrderByDescending(i => i.IsMain)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }
    }
}