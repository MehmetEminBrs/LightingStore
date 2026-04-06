using LightingStore.Api.Data;
using LightingStore.Api.Dtos.Address;
using LightingStore.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LightingStore.Api.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize]
public class AddressController : ControllerBase
{
    private readonly LightingStoreDbContext _context;

    public AddressController(LightingStoreDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyAddresses()
    {
        var userId = GetUserId();

        var addresses = await _context.UserAddresses
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(addresses);
    }

    [HttpPost]
    public async Task<IActionResult> AddAddress(CreateAddressDto dto)
    {
        var userId = GetUserId();

        if (dto.IsDefault)
        {
            var defaults = await _context.UserAddresses
                .Where(x => x.UserId == userId && x.IsDefault)
                .ToListAsync();

            foreach (var item in defaults)
                item.IsDefault = false;
        }

        var address = new UserAddress
        {
            UserId = userId,
            AddressTitle = dto.AddressTitle,
            FullName = dto.FullName,
            Phone = dto.Phone,
            City = dto.City,
            District = dto.District,
            Neighborhood = dto.Neighborhood,
            AddressLine = dto.AddressLine,
            PostalCode = dto.PostalCode,
            IsDefault = dto.IsDefault,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserAddresses.Add(address);
        await _context.SaveChangesAsync();

        return Ok(address);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddress(int id, UpdateAddressDto dto)
    {
        var userId = GetUserId();

        var address = await _context.UserAddresses
            .FirstOrDefaultAsync(x => x.AddressId == id && x.UserId == userId);

        if (address == null)
            return NotFound();

        if (dto.IsDefault)
        {
            var defaults = await _context.UserAddresses
                .Where(x => x.UserId == userId && x.IsDefault)
                .ToListAsync();

            foreach (var item in defaults)
                item.IsDefault = false;
        }

        address.AddressTitle = dto.AddressTitle;
        address.FullName = dto.FullName;
        address.Phone = dto.Phone;
        address.City = dto.City;
        address.District = dto.District;
        address.Neighborhood = dto.Neighborhood;
        address.AddressLine = dto.AddressLine;
        address.PostalCode = dto.PostalCode;
        address.IsDefault = dto.IsDefault;

        await _context.SaveChangesAsync();

        return Ok(address);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var userId = GetUserId();

        var address = await _context.UserAddresses
            .FirstOrDefaultAsync(x => x.AddressId == id && x.UserId == userId);

        if (address == null)
            return NotFound();

        _context.UserAddresses.Remove(address);
        await _context.SaveChangesAsync();

        return Ok("Address deleted");
    }
}