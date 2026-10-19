using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Uniformes.Api.Entities;

namespace Uniformes.Api.Auth;

public class TokenService
{
    private readonly SymmetricSecurityKey _clave;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _horasExpiracion;

    public TokenService(IConfiguration configuration, IWebHostEnvironment entorno)
    {
        _issuer = configuration["Jwt:Issuer"] ?? "uniformes-app";
        _audience = configuration["Jwt:Audience"] ?? "uniformes-app-front";
        _horasExpiracion = int.TryParse(configuration["Jwt:ExpirationHours"], out var h) ? h : 12;

        var secreto = configuration["Jwt:Secret"];
        if (string.IsNullOrWhiteSpace(secreto))
        {
            if (!entorno.IsDevelopment())
            {
                throw new InvalidOperationException("Jwt:Secret es obligatorio fuera de Development.");
            }

            var temporal = new byte[64];
            Random.Shared.NextBytes(temporal);
            secreto = Convert.ToBase64String(temporal);
            Console.WriteLine("[WARN] Jwt:Secret no configurado; se usa una clave efímera (los tokens morirán al reiniciar).");
        }

        if (Encoding.UTF8.GetByteCount(secreto) < 32)
        {
            throw new InvalidOperationException("Jwt:Secret debe tener al menos 32 bytes.");
        }

        _clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secreto));
    }

    public string CrearToken(User usuario)
    {
        var ahora = DateTime.UtcNow;
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Name, usuario.Username),
            new(ClaimTypes.Role, usuario.Role),
            new("username", usuario.Username),
            new("role", usuario.Role)
        };

        var credenciales = new SigningCredentials(_clave, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            notBefore: ahora,
            expires: ahora.AddHours(_horasExpiracion),
            signingCredentials: credenciales);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
