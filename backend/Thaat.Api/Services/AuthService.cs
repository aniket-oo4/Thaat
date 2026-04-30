using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Thaat.Api.Data;
using Thaat.Api.Models;

namespace Thaat.Api.Services;

/// <summary>
/// Authentication service with JWT token generation
/// Supports Admin and SuperAdmin roles
/// </summary>
public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task SeedDefaultAdminAsync();
}

public class AuthService : IAuthService
{
    private readonly MongoDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(MongoDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _db.AdminUsers
            .Find(u => u.Username == request.Username && u.IsActive)
            .FirstOrDefaultAsync();

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        // Update last login
        var update = Builders<AdminUser>.Update.Set(u => u.LastLogin, DateTime.UtcNow);
        await _db.AdminUsers.UpdateOneAsync(u => u.Id == user.Id, update);

        // Generate JWT
        var token = GenerateToken(user);
        var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60");

        return new LoginResponse
        {
            Token = token,
            Role = user.Role,
            Username = user.Username,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
        };
    }

    public async Task SeedDefaultAdminAsync()
    {
        var existingAdmin = await _db.AdminUsers
            .Find(u => u.Role == "SuperAdmin")
            .FirstOrDefaultAsync();

        if (existingAdmin != null) return;

        var username = _config["DefaultAdmin:Username"] ?? "admin";
        var password = _config["DefaultAdmin:Password"] ?? "thaat@2024";
        var role = _config["DefaultAdmin:Role"] ?? "SuperAdmin";

        var admin = new AdminUser
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            await _db.AdminUsers.InsertOneAsync(admin);
        }
        catch (MongoWriteException)
        {
            // Username already exists - ignore
        }
    }

    private string GenerateToken(AdminUser user)
    {
        var secret = _config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
        var issuer = _config["Jwt:Issuer"] ?? "Thaat.Api";
        var audience = _config["Jwt:Audience"] ?? "Thaat.Frontend";
        var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("userId", user.Id ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
