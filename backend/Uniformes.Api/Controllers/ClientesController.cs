using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Uniformes.Api.Data;
using Uniformes.Api.Dtos;
using Uniformes.Api.Entities;
using Uniformes.Api.Infrastructure;

namespace Uniformes.Api.Controllers;

[ApiController]
[Route("api/clientes")]
public class ClientesController(UniformesDbContext db) : ControllerBase
{
    private static IQueryable<Cliente> Filtrar(IQueryable<Cliente> q, IQueryCollection query)
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

    private static IQueryable<Cliente> Buscar(IQueryable<Cliente> q, IQueryCollection query)
    {
        var termino = Filtro.Texto(query, "buscar");
        if (string.IsNullOrWhiteSpace(termino))
        {
            return q;
        }

        var t = termino.ToLower();
        var campos = Filtro.Campos(query);
        var usarNombre = Filtro.Usa(campos, "nombre");
        var usarNit = Filtro.Usa(campos, "nit");
        var usarEmail = Filtro.Usa(campos, "email");
        var usarCiudad = Filtro.Usa(campos, "ciudad");
        var usarTelefono = Filtro.Usa(campos, "telefono");

        return q.Where(x =>
            (usarNombre && x.Nombre.ToLower().Contains(t)) ||
            (usarNit && x.Nit.ToLower().Contains(t)) ||
            (usarEmail && x.Email != null && x.Email.ToLower().Contains(t)) ||
            (usarCiudad && x.Ciudad != null && x.Ciudad.ToLower().Contains(t)) ||
            (usarTelefono && x.Telefono.ToLower().Contains(t)));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var q = Filtrar(db.Clientes.AsNoTracking().AsQueryable(), Request.Query);
        var clientes = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(clientes.Select(c => c.ToDto()));
    }

    [HttpGet("paginado")]
    public async Task<IActionResult> GetPaginado()
    {
        var q = Buscar(Filtrar(db.Clientes.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var total = await q.CountAsync();
        var pagina = Filtro.Pagina(Request.Query);
        var limite = Filtro.Limite(Request.Query);
        var data = await q.OrderBy(x => x.Id).Skip((pagina - 1) * limite).Take(limite).ToListAsync();
        return Ok(new { data = data.Select(c => c.ToDto()).ToList(), total, pagina, limite });
    }

    [HttpGet("buscar")]
    public async Task<IActionResult> GetBuscar()
    {
        var q = Buscar(Filtrar(db.Clientes.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var clientes = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(clientes.Select(c => c.ToDto()));
    }

    [HttpGet("conteo")]
    public async Task<IActionResult> GetConteo()
    {
        var q = Filtrar(db.Clientes.AsNoTracking().AsQueryable(), Request.Query);
        return Ok(new { conteo = await q.CountAsync() });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cliente = await db.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (cliente is null)
        {
            return NotFound(new { error = "Cliente no encontrado" });
        }
        return Ok(cliente.ToDto());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            var b = new JsonBody(body);
            var cliente = new Cliente
            {
                Id = b.Entero("id") ?? 0,
                Nombre = b.Cadena("nombre") ?? "",
                Telefono = b.Cadena("telefono") ?? "",
                Email = b.Cadena("email"),
                Direccion = b.Cadena("direccion"),
                Ciudad = b.Cadena("ciudad"),
                Nit = b.Cadena("nit") ?? "",
                Habilitado = true,
                FechaDeshabilitado = b.Fecha("fechaDeshabilitado"),
                CreatedAt = b.Fecha("createdAt"),
                UpdatedAt = b.Fecha("updatedAt")
            };

            db.Clientes.Add(cliente);
            await db.SaveChangesAsync();
            return Ok(cliente.ToDto());
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

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] JsonElement body)
    {
        var cliente = await db.Clientes.FindAsync(id);
        if (cliente is null)
        {
            return NotFound(new { error = "Cliente no encontrado" });
        }

        try
        {
            var b = new JsonBody(body);
            if (b.NoNulo("nombre")) cliente.Nombre = b.Cadena("nombre")!;
            if (b.NoNulo("telefono")) cliente.Telefono = b.Cadena("telefono")!;
            if (b.NoNulo("email")) cliente.Email = b.Cadena("email");
            if (b.NoNulo("direccion")) cliente.Direccion = b.Cadena("direccion");
            if (b.NoNulo("ciudad")) cliente.Ciudad = b.Cadena("ciudad");
            if (b.NoNulo("nit")) cliente.Nit = b.Cadena("nit")!;
            if (b.NoNulo("habilitado")) cliente.Habilitado = b.Bool("habilitado") ?? cliente.Habilitado;
            if (b.Presente("fechaDeshabilitado")) cliente.FechaDeshabilitado = b.Fecha("fechaDeshabilitado");
            if (b.Presente("createdAt")) cliente.CreatedAt = b.Fecha("createdAt");
            if (b.Presente("updatedAt")) cliente.UpdatedAt = b.Fecha("updatedAt");

            await db.SaveChangesAsync();
            return Ok(cliente.ToDto());
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

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cliente = await db.Clientes.FindAsync(id);
        if (cliente is null)
        {
            return NotFound(new { error = "Cliente no encontrado" });
        }

        try
        {
            cliente.Habilitado = false;
            await db.SaveChangesAsync();
            return Ok(new { success = true, message = "Cliente deshabilitado", cliente = cliente.ToDto() });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }
}
