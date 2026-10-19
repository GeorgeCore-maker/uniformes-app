using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uniformes.Api.Data;
using Uniformes.Api.Dtos;
using Uniformes.Api.Entities;
using Uniformes.Api.Infrastructure;

namespace Uniformes.Api.Controllers;

[ApiController]
[Route("api/productos")]
public class ProductosController(UniformesDbContext db) : ControllerBase
{
    private static IQueryable<Producto> Filtrar(IQueryable<Producto> q, IQueryCollection query)
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

    private static IQueryable<Producto> Buscar(IQueryable<Producto> q, IQueryCollection query)
    {
        var termino = Filtro.Texto(query, "buscar");
        if (string.IsNullOrWhiteSpace(termino))
        {
            return q;
        }

        var t = termino.ToLower();
        var campos = Filtro.Campos(query);
        var usarNombre = Filtro.Usa(campos, "nombre");
        var usarCategoria = Filtro.Usa(campos, "categoria");
        var usarDescripcion = Filtro.Usa(campos, "descripcion");

        return q.Where(x =>
            (usarNombre && x.Nombre.ToLower().Contains(t)) ||
            (usarCategoria && x.Categoria.ToLower().Contains(t)) ||
            (usarDescripcion && x.Descripcion != null && x.Descripcion.ToLower().Contains(t)));
    }

    private static void AplicarWhitelist(Producto producto, JsonBody b)
    {
        if (b.NoNulo("nombre")) producto.Nombre = b.Cadena("nombre")!;
        if (b.NoNulo("descripcion")) producto.Descripcion = b.Cadena("descripcion");
        if (b.NoNulo("categoria")) producto.Categoria = b.Cadena("categoria")!;
        if (b.NoNulo("talla")) producto.Talla = b.Cadena("talla");
        if (b.Doble("precio") is double precio) producto.Precio = precio;
        if (b.Doble("costo") is double costo) producto.Costo = costo;
        if (b.Entero("stock") is int stock) producto.Stock = stock;
        if (b.Entero("stockMinimo") is int stockMinimo) producto.StockMinimo = stockMinimo;
        if (b.Bool("requiereConfeccion") is bool requiere) producto.RequiereConfeccion = requiere;
        if (b.Bool("habilitado") is bool habilitado) producto.Habilitado = habilitado;
        if (b.Presente("fechaDeshabilitado")) producto.FechaDeshabilitado = b.Fecha("fechaDeshabilitado");
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var q = Filtrar(db.Productos.AsNoTracking().AsQueryable(), Request.Query);
        var productos = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(productos.Select(p => p.ToDto()));
    }

    [HttpGet("paginado")]
    public async Task<IActionResult> GetPaginado()
    {
        var q = Buscar(Filtrar(db.Productos.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var total = await q.CountAsync();
        var pagina = Filtro.Pagina(Request.Query);
        var limite = Filtro.Limite(Request.Query);
        var data = await q.OrderBy(x => x.Id).Skip((pagina - 1) * limite).Take(limite).ToListAsync();
        return Ok(new { data = data.Select(p => p.ToDto()).ToList(), total, pagina, limite });
    }

    [HttpGet("buscar")]
    public async Task<IActionResult> GetBuscar()
    {
        var q = Buscar(Filtrar(db.Productos.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var productos = await q.OrderBy(x => x.Id).ToListAsync();
        return Ok(productos.Select(p => p.ToDto()));
    }

    [HttpGet("conteo")]
    public async Task<IActionResult> GetConteo()
    {
        var q = Filtrar(db.Productos.AsNoTracking().AsQueryable(), Request.Query);
        return Ok(new { conteo = await q.CountAsync() });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var producto = await db.Productos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (producto is null)
        {
            return NotFound(new { error = "Producto no encontrado" });
        }
        return Ok(producto.ToDto());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            var b = new JsonBody(body);
            var producto = new Producto
            {
                Id = b.Entero("id") ?? 0,
                Habilitado = true
            };
            AplicarWhitelist(producto, b);

            db.Productos.Add(producto);
            await db.SaveChangesAsync();
            return Ok(producto.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] JsonElement body)
    {
        var producto = await db.Productos.FindAsync(id);
        if (producto is null)
        {
            return NotFound(new { error = "Producto no encontrado" });
        }

        try
        {
            AplicarWhitelist(producto, new JsonBody(body));
            await db.SaveChangesAsync();
            return Ok(producto.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await db.Productos.FindAsync(id);
        if (producto is null)
        {
            return NotFound(new { error = "Producto no encontrado" });
        }

        try
        {
            producto.Habilitado = false;
            await db.SaveChangesAsync();
            return Ok(new { success = true, message = "Producto deshabilitado", producto = producto.ToDto() });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }
}
