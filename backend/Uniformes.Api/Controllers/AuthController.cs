using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uniformes.Api.Auth;
using Uniformes.Api.Data;
using Uniformes.Api.Entities;

namespace Uniformes.Api.Controllers;

public record LoginRequest(string? Username, string? Password);

[ApiController]
[Route("api/auth")]
public class AuthController(UniformesDbContext db, TokenService tokens) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        try
        {
            var username = req.Username;
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrEmpty(req.Password))
            {
                return Unauthorized(new { error = "Credenciales inválidas", message = "Usuario no encontrado" });
            }

            var usuario = await db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Username == username && u.Habilitado);

            if (usuario is null)
            {
                return Unauthorized(new { error = "Credenciales inválidas", message = "Usuario no encontrado" });
            }

            if (!PasswordService.Verify(req.Password!, usuario.Password))
            {
                return Unauthorized(new { error = "Credenciales inválidas", message = "Contraseña incorrecta" });
            }

            if (!PasswordService.EsBcrypt(usuario.Password))
            {
                var hash = PasswordService.Hash(req.Password!);
                await db.Users.Where(u => u.Id == usuario.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(u => u.Password, hash));
            }

            var token = tokens.CrearToken(usuario);

            return Ok(new
            {
                message = "Login exitoso",
                user = new
                {
                    id = usuario.Id,
                    username = usuario.Username,
                    role = usuario.Role,
                    email = usuario.Email,
                    token
                },
                role = usuario.Role,
                token
            });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }
}
