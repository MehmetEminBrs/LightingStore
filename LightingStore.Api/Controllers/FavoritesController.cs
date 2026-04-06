using LightingStore.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _service;

    public FavoritesController(IFavoriteService service)
    {
        _service = service;
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> ToggleFavorite(int productId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        await _service.ToggleFavoriteAsync(userId, productId);

        return Ok("Favori güncellendi");
    }

    [HttpGet]
    public async Task<IActionResult> GetMyFavorites()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var favorites = await _service.GetUserFavoritesAsync(userId);

        return Ok(favorites);
    }

    
}