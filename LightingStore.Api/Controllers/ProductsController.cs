using LightingStore.Api.Data;
using LightingStore.Api.DTOs.Product;
using LightingStore.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
namespace LightingStore.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly LightingStoreDbContext _context;

    public ProductsController(LightingStoreDbContext context)
    {
        _context = context;
    }

[HttpGet]
public async Task<IActionResult> GetAll(string? search, int? limit)
{
    int? userId = null;

    if (User.Identity != null && User.Identity.IsAuthenticated)
    {
        var userIdClaim = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userIdClaim))
            userId = int.Parse(userIdClaim);
    }

    var favoriteProductIds = new List<int>();

    if (userId != null)
    {
        favoriteProductIds = await _context.Favorites
            .Where(f => f.UserId == userId)
            .Select(f => f.ProductId)
            .ToListAsync();
    }

    var query = _context.Products
        .Include(p => p.Category)
        .Include(p => p.ProductImages)
        .Include(p => p.ProductStock)
        .Where(p => p.IsActive)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        search = search.ToLower();

        query = query.Where(p =>
            p.ProductName.ToLower().Contains(search) ||
            p.Category.CategoryName.ToLower().Contains(search)
        );
    }

    if (limit.HasValue)
    {
        query = query.Take(limit.Value);
    }

    var products = await query
        .Select(p => new ProductListDto
        {
            ProductId = p.ProductId,
            ProductName = p.ProductName,
            CategoryId = p.CategoryId,
            Slug = p.Slug,
            Price = p.Price,
            DiscountPrice = p.DiscountPrice,
            IsPopular = p.IsPopular,
            IsNew = p.IsNew,
            PopularOrder = p.PopularOrder,
            CategoryName = p.Category.CategoryName,
            Quantity = p.ProductStock.Quantity,

            MainImageUrl = p.ProductImages
                .Where(i => i.IsMain)
                .Select(i => i.ImageUrl)
                .FirstOrDefault(),

            IsFavorite = userId != null && favoriteProductIds.Contains(p.ProductId)
        })
        .ToListAsync();

    return Ok(products);
}

    [HttpGet("slug/{slug}")]
public async Task<IActionResult> GetBySlug(string slug)
{
    var product = await _context.Products
        .Include(p => p.ProductImages)
        .Include(p => p.Category)
        .Where(p => p.Slug == slug && p.IsActive)
        .Select(p => new ProductDetailDto
        {
            ProductId = p.ProductId,
            ProductName = p.ProductName,
            Slug = p.Slug,
            Description = p.Description,
            Price = p.Price,
            DiscountPrice = p.DiscountPrice,
            IsPopular = p.IsPopular,
            PopularOrder = p.PopularOrder,
            IsNew = p.IsNew,
            CategoryId = p.CategoryId,
            CategoryName = p.Category.CategoryName,
            Images = p.ProductImages
                .OrderByDescending(i => i.IsMain)
                .Select(i => i.ImageUrl)
                .ToList()
        })
        .FirstOrDefaultAsync();

    if (product == null) return NotFound();
    return Ok(product);
}

    [HttpGet("popular")]
    public async Task<IActionResult> GetPopular()
    {
        var products = await _context.Products
            .Where(p => p.IsPopular)
            .OrderBy(p => p.PopularOrder)
            .Include(p => p.ProductImages)
            .Select(p => new ProductListDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Slug = p.Slug,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                IsPopular = p.IsPopular,
                PopularOrder = p.PopularOrder,
                MainImageUrl = p.ProductImages
                    .Where(i => i.IsMain)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductImages)
            .Where(p => p.ProductId == id)
            .Select(p => new ProductDetailDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Slug = p.Slug,
                Description = p.Description,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                IsPopular = p.IsPopular,
                PopularOrder = p.PopularOrder,
                IsNew = p.IsNew,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.CategoryName,
                Images = p.ProductImages
                    .OrderByDescending(i => i.IsMain)
                    .Select(i => i.ImageUrl)
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (product == null)
            return NotFound();

        return Ok(product);
    }

    [Authorize(Roles = "Admin")]
[HttpPost]
public async Task<IActionResult> Create([FromForm] ProductCreateDto dto)
{
    var product = new Product
    {
        ProductName = dto.ProductName,
        Slug = dto.Slug,
        Description = dto.Description,
        Price = dto.Price,
        DiscountPrice = dto.DiscountPrice,
        IsPopular = dto.IsPopular,
        PopularOrder = dto.IsPopular ? dto.PopularOrder : null,
        IsNew = dto.IsNew,
        CategoryId = dto.CategoryId,
        IsActive = true
    };

    _context.Products.Add(product);
    await _context.SaveChangesAsync();

    if (dto.Images != null && dto.Images.Count > 0)
    {
        var uploadsFolder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot", "uploads", "products"
        );

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        bool first = true;

        foreach (var file in dto.Images)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            _context.ProductImages.Add(new ProductImage
            {
                ProductId = product.ProductId,
                ImageUrl = $"/uploads/products/{fileName}",
                IsMain = first
            });

            first = false;
        }

        await _context.SaveChangesAsync();
    }

    return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, null);
}


   [Authorize(Roles = "Admin")]
[HttpPut("{id}")]
public async Task<IActionResult> Update(int id, [FromForm] ProductUpdateDto dto)
{
    var product = await _context.Products
        .Include(p => p.ProductImages)
        .FirstOrDefaultAsync(p => p.ProductId == id);

    if (product == null)
        return NotFound();

    product.ProductName = dto.ProductName;
    product.Slug = dto.Slug;
    product.Description = dto.Description;
    product.Price = dto.Price;
    product.DiscountPrice = dto.DiscountPrice;
    product.IsPopular = dto.IsPopular;
    product.PopularOrder = dto.IsPopular ? dto.PopularOrder : null;
    product.IsNew = dto.IsNew;

    product.CategoryId = dto.CategoryId;

    var uploadsFolder = Path.Combine(
        Directory.GetCurrentDirectory(),
        "wwwroot", "uploads", "products"
    );

    if (!Directory.Exists(uploadsFolder))
        Directory.CreateDirectory(uploadsFolder);

    if (dto.DeleteImageIds != null && dto.DeleteImageIds.Count > 0)
    {
        var imagesToDelete = product.ProductImages
            .Where(i => dto.DeleteImageIds.Contains(i.ImageId))
            .ToList();

        foreach (var img in imagesToDelete)
        {
            var path = Path.Combine("wwwroot", img.ImageUrl.TrimStart('/'));
            if (System.IO.File.Exists(path))
                System.IO.File.Delete(path);

            _context.ProductImages.Remove(img);
        }
    }

    if (dto.ReplaceImages != null && dto.ReplaceImages.Count > 0)
    {
        foreach (var pair in dto.ReplaceImages)
        {
            var image = product.ProductImages.FirstOrDefault(i => i.ImageId == pair.Key);
            if (image == null) continue;

            var oldPath = Path.Combine("wwwroot", image.ImageUrl.TrimStart('/'));
            if (System.IO.File.Exists(oldPath))
                System.IO.File.Delete(oldPath);

            var file = pair.Value;
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            image.ImageUrl = $"/uploads/products/{fileName}";
        }
    }

    if (dto.NewImages != null && dto.NewImages.Count > 0)
    {
        foreach (var file in dto.NewImages)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            _context.ProductImages.Add(new ProductImage
            {
                ProductId = product.ProductId,
                ImageUrl = $"/uploads/products/{fileName}",
                IsMain = false
            });
        }
    }

    if (dto.MainImageId.HasValue)
    {
        foreach (var img in product.ProductImages)
            img.IsMain = img.ImageId == dto.MainImageId.Value;
    }

    await _context.SaveChangesAsync();
    return NoContent();
}


    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("new")]
    public async Task<IActionResult> GetNew()
    {
        var products = await _context.Products
            .Where(p => p.IsNew && p.IsActive)
            .OrderByDescending(p => p.ProductId) 
            .Include(p => p.ProductImages)
            .Select(p => new ProductListDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Slug = p.Slug,
                Price = p.Price,
                DiscountPrice = p.DiscountPrice,
                IsPopular = p.IsPopular,
                PopularOrder = p.PopularOrder,
                IsNew = p.IsNew,
                MainImageUrl = p.ProductImages
                    .Where(i => i.IsMain)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(products);
    }    
}
