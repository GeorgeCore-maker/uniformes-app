using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uniformes.Api.Auth;
using Uniformes.Api.Data;
using Uniformes.Api.Dtos;
using Uniformes.Api.Entities;
using Uniformes.Api.Infrastructure;

namespace Uniformes.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(UniformesDbContext db) : ControllerBase
{
    private const string Admin = "Admin";

    private static IQueryable<User> Filtrar(IQueryable<User> q, IQueryCollection query)
    {
        if (Filtro.IncluirDeshabilitados(query))
        {
            return q;
        }

        var habilitado = Filtro.Habilitado(query);
        return habilitado is null
            ? q.Where(x => x.Habilitado)
            : q.Where(x => x.Habilitado == habilitado.Value);
    }

    private static IQueryable<User> Buscar(IQueryable<User> q, IQueryCollection query)
    {
        var termino = Filtro.Texto(query, "buscar");
        if (string.IsNullOrWhiteSpace(termino))
        {
            return q;
        }

        var t = termino.ToLower();
        var campos = Filtro.Campos(query);
        var usarUsername = Filtro.Usa(campos, "username", "nombre");
        var usarRole = Filtro.Usa(campos, "role", "rol");
        var usarEmail = Filtro.Usa(campos, "email");

        return q.Where(x =>
            (usarUsername && x.Username.ToLower().Contains(t)) ||
            (usarRole && x.Role.ToLower().Contains(t)) ||
            (usarEmail && x.Email != null && x.Email.ToLower().Contains(t)));
    }

    [HttpGet]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> GetAll()
    {
        var q = Filtrar(db.Users.AsNoTracking().AsQueryable(), Request.Query);
        var usuarios = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(usuarios.Select(u => u.ToDto()));
    }

    [HttpGet("paginado")]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> GetPaginado()
    {
        var q = Buscar(Filtrar(db.Users.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var total = await q.CountAsync();
        var pagina = Filtro.Pagina(Request.Query);
        var limite = Filtro.Limite(Request.Query);
        var data = await q.OrderBy(x => x.Id).Skip((pagina - 1) * limite).Take(limite).ToListAsync();
        return Ok(new { data = data.Select(u => u.ToDto()).ToList(), total, pagina, limite });
    }

    [HttpGet("buscar")]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> GetBuscar()
    {
        var q = Buscar(Filtrar(db.Users.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var usuarios = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(usuarios.Select(u => u.ToDto()));
    }

    [HttpGet("conteo")]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> GetConteo()
    {
        var q = Filtrar(db.Users.AsNoTracking().AsQueryable(), Request.Query);
        return Ok(new { conteo = await q.CountAsync() });
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var propio = User.FindFirst(ClaimTypes.NameIdentifier)?.Value == id.ToString();
        if (!User.IsInRole("ADMIN") && !propio)
        {
            return Forbid();
        }

        var usuario = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        if (usuario is null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }
        return Ok(usuario.ToDto());
    }

    [HttpPost]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            var b = new JsonBody(body);
            var username = b.Cadena("username");
            var password = b.Cadena("password");
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrEmpty(password))
            {
                return BadRequest(new { error = "username y password son requeridos" });
            }

            var usuario = new User
            {
                Id = b.EnteroLargo("id") ?? 0,
                Username = username,
                Password = PasswordService.Hash(password!),
                Role = b.Cadena("role") ?? "",
                Activo = b.Bool("activo") ?? true,
                Habilitado = true,
                Email = b.Cadena("email"),
                FechaDeshabilitado = b.Fecha("fechaDeshabilitado"),
                CreatedAt = b.Fecha("createdAt"),
                UpdatedAt = b.Fecha("updatedAt")
            };

            db.Users.Add(usuario);
            await db.SaveChangesAsync();
            return Ok(usuario.ToDto());
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.InnerException?.Message ?? ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpPut("{id:long}")]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> Update(long id, [FromBody] JsonElement body)
    {
        var usuario = await db.Users.FindAsync(id);
        if (usuario is null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        try
        {
            var b = new JsonBody(body);
            if (b.NoNulo("username")) usuario.Username = b.Cadena("username")!;
            if (b.NoNulo("email")) usuario.Email = b.Cadena("email");
            if (b.NoNulo("role")) usuario.Role = b.Cadena("role") ?? usuario.Role;
            if (b.NoNulo("activo")) usuario.Activo = b.Bool("activo") ?? usuario.Activo;
            if (b.NoNulo("habilitado")) usuario.Habilitado = b.Bool("habilitado") ?? usuario.Habilitado;
            if (b.Presente("fechaDeshabilitado")) usuario.FechaDeshabilitado = b.Fecha("fechaDeshabilitado");
            if (b.Presente("createdAt")) usuario.CreatedAt = b.Fecha("createdAt");
            if (b.Presente("updatedAt")) usuario.UpdatedAt = b.Fecha("updatedAt");

            var password = b.Cadena("password");
            if (!string.IsNullOrEmpty(password))
            {
                usuario.Password = PasswordService.Hash(password!);
            }

            await db.SaveChangesAsync();
            return Ok(usuario.ToDto());
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.InnerException?.Message ?? ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpPatch("{id:long}")]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> Patch(long id, [FromBody] JsonElement body)
    {
        var usuario = await db.Users.FindAsync(id);
        if (usuario is null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        try
        {
            var b = new JsonBody(body);
            if (b.NoNulo("username")) usuario.Username = b.Cadena("username")!;
            if (b.NoNulo("email")) usuario.Email = b.Cadena("email");
            if (b.NoNulo("role")) usuario.Role = b.Cadena("role") ?? usuario.Role;
            if (b.NoNulo("activo")) usuario.Activo = b.Bool("activo") ?? usuario.Activo;
            if (b.NoNulo("habilitado")) usuario.Habilitado = b.Bool("habilitado") ?? usuario.Habilitado;
            if (b.Presente("fechaDeshabilitado")) usuario.FechaDeshabilitado = b.Fecha("fechaDeshabilitado");
            if (b.Presente("updatedAt")) usuario.UpdatedAt = b.Fecha("updatedAt") ?? DateTime.UtcNow;

            var password = b.Cadena("password");
            if (!string.IsNullOrEmpty(password))
            {
                usuario.Password = PasswordService.Hash(password!);
            }

            await db.SaveChangesAsync();
            return Ok(usuario.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpDelete("{id:long}")]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> Delete(long id)
    {
        var usuario = await db.Users.FindAsync(id);
        if (usuario is null)
        {
            return NotFound(new { error = "Usuario no encontrado" });
        }

        try
        {
            usuario.Habilitado = false;
            await db.SaveChangesAsync();
            return Ok(new { message = "Usuario deshabilitado", user = usuario.ToDto() });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }
}
