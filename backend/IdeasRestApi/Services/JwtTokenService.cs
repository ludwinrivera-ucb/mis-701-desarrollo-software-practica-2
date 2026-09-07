using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using IdeasRestApi.Models;

namespace IdeasRestApi.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user, out DateTime expiration)
    {
        var secretKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Error de configuración JWT: 'Jwt:Key' no está definido en la configuración.");

        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("Error de configuración JWT: 'Jwt:Issuer' no está definido en la configuración.");

        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("Error de configuración JWT: 'Jwt:Audience' no está definido en la configuración.");

        var expiryHoursConfig = _configuration["Jwt:ExpiryInHours"]
            ?? throw new InvalidOperationException("Error de configuración JWT: 'Jwt:ExpiryInHours' no está definido en la configuración.");

        if (!int.TryParse(expiryHoursConfig, out var expiryHours) || expiryHours <= 0)
        {
            throw new InvalidOperationException("Error de configuración JWT: 'Jwt:ExpiryInHours' debe ser un número entero positivo válido.");
        }

        expiration = DateTime.UtcNow.AddHours(expiryHours);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiration,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
