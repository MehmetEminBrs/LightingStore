using LightingStore.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LightingStore.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly LightingStoreDbContext _context;

    public AdminController(LightingStoreDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var productCount = await _context.Products.CountAsync();
        var categoryCount = await _context.Categories.CountAsync();

        return Ok(new
        {
            productCount,
            categoryCount
        });
    }
}