using IdeasRestApi.Models;

namespace IdeasRestApi.Services;

public interface IJwtTokenService
{
    string GenerateToken(User user, out DateTime expiration);
}
