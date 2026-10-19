using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Uniformes.Api.Data;
using Uniformes.Api.Dtos;
using Uniformes.Api.Entities;
using Uniformes.Api.Infrastructure;

namespace Uniformes.Api.Controllers;

[ApiController]
[Route("api/categorias")]
public class CategoriasController(UniformesDbContext db) : ControllerBase
{
    private static IQueryable<Categoria> Filtrar(IQueryable<Categoria> q, IQueryCollection query)
    {
        if (Filtro.IncluirDeshabilitados(query))
        {
            return q;
        }

        var habilitado = Filtro.Habilitado(query);
        return habilitado is null ? q : q.Where(x => x.Habilitado == habilitado.Value);
    }

    private static IQueryable<Categoria> Buscar(IQueryable<Categoria> q, IQueryCollection query)
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
        var q = Filtrar(db.Categorias.AsNoTracking().AsQueryable(), Request.Query);
        var categorias = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(categorias.Select(c => c.ToDto()));
    }

    [HttpGet("paginado")]
    public async Task<IActionResult> GetPaginado()
    {
        var q = Buscar(Filtrar(db.Categorias.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var total = await q.CountAsync();
        var pagina = Filtro.Pagina(Request.Query);
        var limite = Filtro.Limite(Request.Query);
        var data = await q.OrderBy(x => x.Id).Skip((pagina - 1) * limite).Take(limite).ToListAsync();
        return Ok(new { data = data.Select(c => c.ToDto()).ToList(), total, pagina, limite });
    }

    [HttpGet("buscar")]
    public async Task<IActionResult> GetBuscar()
    {
        var q = Buscar(Filtrar(db.Categorias.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var categorias = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(categorias.Select(c => c.ToDto()));
    }

    [HttpGet("conteo")]
    public async Task<IActionResult> GetConteo()
    {
        var q = Filtrar(db.Categorias.AsNoTracking().AsQueryable(), Request.Query);
        return Ok(new { conteo = await q.CountAsync() });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var categoria = await db.Categorias.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (categoria is null)
        {
            return NotFound(new { error = "Categoría no encontrada" });
        }
        return Ok(categoria.ToDto());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            var b = new JsonBody(body);
            var categoria = new Categoria
            {
                Id = b.Entero("id") ?? 0,
                Nombre = b.Cadena("nombre") ?? "",
                Descripcion = b.Cadena("descripcion"),
                Habilitado = b.Bool("habilitado") ?? true,
                FechaDeshabilitado = b.Fecha("fechaDeshabilitado"),
                CreatedAt = b.Fecha("createdAt"),
                UpdatedAt = b.Fecha("updatedAt")
            };

            db.Categorias.Add(categoria);
            await db.SaveChangesAsync();
            return Ok(categoria.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] JsonElement body)
    {
        var categoria = await db.Categorias.FindAsync(id);
        if (categoria is null)
        {
            return NotFound(new { error = "Categoría no encontrada" });
        }

        try
        {
            var b = new JsonBody(body);
            if (b.NoNulo("nombre")) categoria.Nombre = b.Cadena("nombre")!;
            if (b.NoNulo("descripcion")) categoria.Descripcion = b.Cadena("descripcion");
            if (b.NoNulo("habilitado")) categoria.Habilitado = b.Bool("habilitado") ?? categoria.Habilitado;
            if (b.Presente("fechaDeshabilitado")) categoria.FechaDeshabilitado = b.Fecha("fechaDeshabilitado");
            if (b.Presente("createdAt")) categoria.CreatedAt = b.Fecha("createdAt");
            if (b.Presente("updatedAt")) categoria.UpdatedAt = b.Fecha("updatedAt");

            await db.SaveChangesAsync();
            return Ok(categoria.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] JsonElement body)
    {
        var categoria = await db.Categorias.FindAsync(id);
        if (categoria is null)
        {
            return NotFound(new { error = "Categoría no encontrada" });
        }

        try
        {
            var b = new JsonBody(body);
            if (b.NoNulo("nombre")) categoria.Nombre = b.Cadena("nombre")!;
            if (b.NoNulo("descripcion")) categoria.Descripcion = b.Cadena("descripcion");
            if (b.NoNulo("habilitado")) categoria.Habilitado = b.Bool("habilitado") ?? categoria.Habilitado;
            if (b.Presente("fechaDeshabilitado")) categoria.FechaDeshabilitado = b.Fecha("fechaDeshabilitado");
            categoria.UpdatedAt = b.Fecha("updatedAt") ?? DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Ok(categoria.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var categoria = await db.Categorias.FindAsync(id);
        if (categoria is null)
        {
            return NotFound(new { error = "Categoría no encontrada" });
        }

        try
        {
            db.Categorias.Remove(categoria);
            await db.SaveChangesAsync();
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }
}
