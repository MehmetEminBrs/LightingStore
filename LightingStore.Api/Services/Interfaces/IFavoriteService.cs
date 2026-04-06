using LightingStore.Api.DTOs.Favorite;

namespace LightingStore.Api.Services.Interfaces;

public interface IFavoriteService
{
    Task ToggleFavoriteAsync(int userId, int productId);
    Task<List<FavoriteListDto>> GetUserFavoritesAsync(int userId);
}