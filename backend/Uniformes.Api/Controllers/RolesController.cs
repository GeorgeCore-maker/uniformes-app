using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uniformes.Api.Data;
using Uniformes.Api.Dtos;
using Uniformes.Api.Entities;
using Uniformes.Api.Infrastructure;

namespace Uniformes.Api.Controllers;

[ApiController]
[Route("api/roles")]
public class RolesController(UniformesDbContext db) : ControllerBase
{
    private const string Admin = "Admin";

    private static IQueryable<Rol> Filtrar(IQueryable<Rol> q, IQueryCollection query)
    {
        if (Filtro.IncluirDeshabilitados(query))
        {
            return q;
        }

        var habilitado = Filtro.Habilitado(query);
        return habilitado is null ? q : q.Where(x => x.Habilitado == habilitado.Value);
    }

    private static string GuardarPermisos(JsonBody b)
    {
        var crudo = b.Crudo("permisos");
        if (crudo is null)
        {
            return "[]";
        }

        if (crudo.Value.ValueKind == JsonValueKind.Array)
        {
            return crudo.Value.GetRawText();
        }

        if (crudo.Value.ValueKind == JsonValueKind.String)
        {
            var texto = crudo.Value.GetString();
            if (string.IsNullOrWhiteSpace(texto))
            {
                return "[]";
            }

            try
            {
                using var doc = JsonDocument.Parse(texto);
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    return texto!;
                }
            }
            catch (JsonException)
            {
            }

            return JsonSerializer.Serialize(new[] { texto });
        }

        return "[]";
    }

    private static IQueryable<Rol> Buscar(IQueryable<Rol> q, IQueryCollection query)
    {
        var termino = Filtro.Texto(query, "buscar");
        if (string.IsNullOrWhiteSpace(termino))
        {
            return q;
        }

        var t = termino.ToLower();
        return q.Where(x =>
            x.Nombre.ToLower().Contains(t) ||
            (x.Descripcion != null && x.Descripcion.ToLower().Contains(t)));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var q = Filtrar(db.Roles.AsNoTracking().AsQueryable(), Request.Query);
        var roles = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(roles.Select(r => r.ToDto()));
    }

    [HttpGet("paginado")]
    public async Task<IActionResult> GetPaginado()
    {
        var q = Buscar(Filtrar(db.Roles.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var total = await q.CountAsync();
        var pagina = Filtro.Pagina(Request.Query);
        var limite = Filtro.Limite(Request.Query);
        var data = await q.OrderBy(x => x.Id).Skip((pagina - 1) * limite).Take(limite).ToListAsync();
        return Ok(new { data = data.Select(r => r.ToDto()).ToList(), total, pagina, limite });
    }

    [HttpGet("buscar")]
    public async Task<IActionResult> GetBuscar()
    {
        var q = Buscar(Filtrar(db.Roles.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var roles = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(roles.Select(r => r.ToDto()));
    }

    [HttpGet("conteo")]
    public async Task<IActionResult> GetConteo()
    {
        var q = Filtrar(db.Roles.AsNoTracking().AsQueryable(), Request.Query);
        return Ok(new { conteo = await q.CountAsync() });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var rol = await db.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
        if (rol is null)
        {
            return NotFound(new { error = "Rol no encontrado" });
        }
        return Ok(rol.ToDto());
    }

    [HttpPost]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            var b = new JsonBody(body);
            var nombre = b.Cadena("nombre");
            if (string.IsNullOrWhiteSpace(nombre))
            {
                return BadRequest(new { error = "nombre es requerido" });
            }

            var rol = new Rol
            {
                Id = b.Entero("id") ?? 0,
                Nombre = nombre!,
                Descripcion = b.Cadena("descripcion"),
                Permisos = GuardarPermisos(b),
                Activo = b.Bool("activo") ?? true,
                Habilitado = b.Bool("habilitado") ?? true,
                FechaDeshabilitado = b.Fecha("fechaDeshabilitado"),
                CreatedAt = b.Fecha("createdAt"),
                UpdatedAt = b.Fecha("updatedAt")
            };

            db.Roles.Add(rol);
            await db.SaveChangesAsync();
            return Ok(rol.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> Update(int id, [FromBody] JsonElement body)
    {
        var rol = await db.Roles.FindAsync(id);
        if (rol is null)
        {
            return NotFound(new { error = "Rol no encontrado" });
        }

        try
        {
            var b = new JsonBody(body);
            if (b.NoNulo("nombre")) rol.Nombre = b.Cadena("nombre")!;
            if (b.NoNulo("descripcion")) rol.Descripcion = b.Cadena("descripcion");
            if (b.Presente("permisos")) rol.Permisos = GuardarPermisos(b);
            if (b.NoNulo("activo")) rol.Activo = b.Bool("activo") ?? rol.Activo;
            if (b.NoNulo("habilitado")) rol.Habilitado = b.Bool("habilitado") ?? rol.Habilitado;
            if (b.Presente("fechaDeshabilitado")) rol.FechaDeshabilitado = b.Fecha("fechaDeshabilitado");
            if (b.Presente("createdAt")) rol.CreatedAt = b.Fecha("createdAt");
            if (b.Presente("updatedAt")) rol.UpdatedAt = b.Fecha("updatedAt");

            await db.SaveChangesAsync();
            return Ok(rol.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpPatch("{id:int}")]
    [Authorize(Policy = Admin)]
    public async Task<IActionResult> Patch(int id, [FromBody] JsonElement body)
    {
        var rol = await db.Roles.FindAsync(id);
        if (rol is null)
        {
            return NotFound(new { error = "Rol no encontrado" });
        }

        try
        {
            var b = new JsonBody(body);
            if (b.NoNulo("nombre")) rol.Nombre = b.Cadena("nombre")!;
            if (b.NoNulo("descripcion")) rol.Descripcion = b.Cadena("descripcion");
            if (b.Presente("permisos")) rol.Permisos = GuardarPermisos(b);
            if (b.NoNulo("activo")) rol.Activo = b.Bool("activo") ?? rol.Activo;
            if (b.NoNulo("habilitado")) rol.Habilitado = b.Bool("habilitado") ?? rol.Habilitado;
            if (b.Presente("fechaDeshabilitado")) rol.FechaDeshabilitado = b.Fecha("fechaDeshabilitado");
            rol.UpdatedAt = b.Fecha("updatedAt") ?? DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Ok(rol.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }
}
