using LightingStore.Api.Data;
using LightingStore.Api.Dtos.ProductImage;
using LightingStore.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace LightingStore.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/product-images")]
public class ProductImagesController : ControllerBase
{
    private readonly LightingStoreDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ProductImagesController(LightingStoreDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet("product/{productId:int}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var images = await _context.ProductImages
            .Where(x => x.ProductId == productId)
            .Select(x => new ProductImageListDto
            {
                ImageId = x.ImageId,
                ImageUrl = x.ImageUrl,
                IsMain = x.IsMain
            })
            .ToListAsync();

        return Ok(images);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] ProductImageCreateDto dto)
    {
        var productExists = await _context.Products
            .AnyAsync(p => p.ProductId == dto.ProductId);

        if (!productExists)
            return BadRequest("Product not found");

        if (dto.Files == null || dto.Files.Count == 0)
            return BadRequest("No file uploaded");

        var uploadPath = Path.Combine(_env.WebRootPath, "uploads", "products");
        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var createdImages = new List<ProductImage>();

        foreach (var file in dto.Files)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            createdImages.Add(new ProductImage
            {
                ProductId = dto.ProductId,
                ImageUrl = $"/uploads/products/{fileName}",
                IsMain = false
            });
        }

        if (dto.IsMain)
        {
            var oldMainImages = await _context.ProductImages
                .Where(x => x.ProductId == dto.ProductId && x.IsMain)
                .ToListAsync();

            foreach (var img in oldMainImages)
                img.IsMain = false;

            createdImages.First().IsMain = true;
        }

        if (!await _context.ProductImages.AnyAsync(x => x.ProductId == dto.ProductId))
            createdImages.First().IsMain = true;

        _context.ProductImages.AddRange(createdImages);
        await _context.SaveChangesAsync();

        return Ok(createdImages.Select(x => x.ImageUrl));
    }

    [HttpPut("set-main/{imageId:int}")]
    public async Task<IActionResult> SetMain(int imageId)
    {
        var image = await _context.ProductImages.FindAsync(imageId);
        if (image == null)
            return NotFound();

        var images = await _context.ProductImages
            .Where(x => x.ProductId == image.ProductId)
            .ToListAsync();

        foreach (var img in images)
            img.IsMain = img.ImageId == imageId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var image = await _context.ProductImages.FindAsync(id);
        if (image == null)
            return NotFound();

        var path = Path.Combine(_env.WebRootPath, image.ImageUrl.TrimStart('/'));
        if (System.IO.File.Exists(path))
            System.IO.File.Delete(path);

        _context.ProductImages.Remove(image);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
