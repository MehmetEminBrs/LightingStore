using BCrypt.Net;
using LightingStore.Api.Data;
using LightingStore.Api.Dtos.Auth;
using LightingStore.Api.Entities;
using LightingStore.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace LightingStore.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly LightingStoreDbContext _context;
    private readonly JwtService _jwtService;
    private readonly EmailService _emailService;

    public AuthController(
        LightingStoreDbContext context,
        JwtService jwtService,
        EmailService emailService,
        IConfiguration configuration)

    {
        _context = context;
        _jwtService = jwtService;
        _emailService = emailService;
        _configuration = configuration;

    }

    private int GetUserId() =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(x => x.Email == dto.Email))
            return BadRequest("Email already exists");

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = 2
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("User created. Please verify your email.");
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail(string token)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.EmailVerifyToken == token);

        if (user == null)
            return BadRequest("Invalid token");

        if (user.EmailVerifyExpire == null || user.EmailVerifyExpire < DateTime.UtcNow)
            return BadRequest("Token expired");

        user.EmailConfirmed = true;
        user.EmailVerifyToken = null;
        user.EmailVerifyExpire = null;

        await _context.SaveChangesAsync();
        return Ok("Email verified. You can now login.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid email or password");

        var token = _jwtService.GenerateToken(user);
        return Ok(new { token });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            email  = User.FindFirst(ClaimTypes.Email)?.Value,
            role   = User.FindFirst(ClaimTypes.Role)?.Value
        });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _context.Users.FindAsync(GetUserId());

        if (user == null) return NotFound();

        return Ok(new
        {
            user.FullName,
            user.Phone,
            user.Email
        });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var user = await _context.Users.FindAsync(GetUserId());

        if (user == null) return NotFound();

        user.FullName = dto.FullName;
        user.Phone    = dto.Phone;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.FullName,
            user.Phone,
            user.Email
        });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(GetUserId());

        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest("Mevcut şifre hatalı");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok("Şifre başarıyla değiştirildi");
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (user == null)
            return Ok("If this email exists, a reset link was sent.");

        user.ResetPasswordToken  = Guid.NewGuid().ToString();
        user.ResetPasswordExpire = DateTime.UtcNow.AddMinutes(15);

        await _context.SaveChangesAsync();

        var baseUrl = _configuration["AppSettings:BaseUrl"];
        var link = $"{baseUrl}/reset-password?token={user.ResetPasswordToken}";
        await _emailService.SendAsync(
            user.Email,
            "Şifre sıfırlama",
            $"Şifrenizi sıfırlamak için <a href='{link}'>buraya tıklayın</a><br>Bu link 15 dakika geçerlidir."
        );

        return Ok("If this email exists, a reset link was sent.");
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.ResetPasswordToken == dto.Token);

        if (user == null)
            return BadRequest("Invalid token");

        if (user.ResetPasswordExpire == null || user.ResetPasswordExpire < DateTime.UtcNow)
            return BadRequest("Token expired");

        user.PasswordHash        = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.ResetPasswordToken  = null;
        user.ResetPasswordExpire = null;

        await _context.SaveChangesAsync();
        return Ok("Password successfully reset");
    }
}