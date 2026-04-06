using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LightingStore.Api.Entities;
using Microsoft.IdentityModel.Tokens;

namespace LightingStore.Api.Services;

public class JwtService
{
    private readonly IConfiguration _config;
    private readonly byte[] _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expireMinutes;

    public JwtService(IConfiguration config)
    {
        _config = config;

        _issuer = _config["Jwt:Issuer"]
            ?? throw new Exception("Jwt:Issuer missing");

        _audience = _config["Jwt:Audience"]
            ?? throw new Exception("Jwt:Audience missing");

        var keyString = _config["Jwt:Key"]
            ?? throw new Exception("Jwt:Key missing");

        if (keyString.Length < 32)
            throw new Exception("Jwt:Key must be at least 256 bit (32 char)");

        _key = Encoding.UTF8.GetBytes(keyString);

        if (!int.TryParse(_config["Jwt:ExpireMinutes"], out _expireMinutes))
            throw new Exception("Jwt:ExpireMinutes invalid");
    }

    public string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),

            new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Customer"),

            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),

            new Claim(ClaimTypes.Name, user.Email)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(_key),
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(_expireMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
