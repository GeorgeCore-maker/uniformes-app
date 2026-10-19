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
[Route("api/produccion")]
public class ProduccionController(UniformesDbContext db) : ControllerBase
{
    private static IQueryable<ItemProduccion> ConIncludes(IQueryable<ItemProduccion> q) =>
        q.Include(i => i.Producto)
            .Include(i => i.Detalle).ThenInclude(d => d.Pedido).ThenInclude(p => p.Cliente);

    private static IQueryable<ItemProduccion> Filtrar(IQueryable<ItemProduccion> q, IQueryCollection query)
    {
        if (!Filtro.IncluirDeshabilitados(query))
        {
            var habilitado = Filtro.Habilitado(query);
            q = habilitado is null
                ? q.Where(i => i.Habilitado)
                : q.Where(i => i.Habilitado == habilitado.Value);
        }

        return q;
    }

    private static void AplicarWhitelist(ItemProduccion item, JsonBody b)
    {
        if (b.Presente("detalleId")) item.DetalleId = b.Entero("detalleId") ?? item.DetalleId;
        if (b.Presente("productoId")) item.ProductoId = b.Entero("productoId") ?? item.ProductoId;
        if (b.Presente("cantidad")) item.Cantidad = b.Entero("cantidad") ?? item.Cantidad;
        if (b.Presente("fechaInicio")) item.FechaInicio = b.Fecha("fechaInicio");
        if (b.Presente("observaciones")) item.Observaciones = b.Cadena("observaciones");
        if (b.Presente("habilitado")) item.Habilitado = b.Bool("habilitado") ?? item.Habilitado;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var q = Filtrar(db.ItemsProduccion.AsNoTracking().AsQueryable(), Request.Query);
        var items = await ConIncludes(q)
            .OrderByDescending(i => i.CreatedAt)
            .ThenByDescending(i => i.Id)
            .ToListAsync();
        return Ok(items.Select(i => i.ToDto(conAnidamiento: true)));
    }

    [HttpGet("debug")]
    public async Task<IActionResult> GetDebug()
    {
        var items = await ConIncludes(db.ItemsProduccion.AsNoTracking().AsQueryable())
            .OrderByDescending(i => i.Id)
            .ToListAsync();
        return Ok(items.Select(i => i.ToDto(conAnidamiento: true)));
    }

    [HttpGet("pendientes")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPendientes()
    {
        var pedidos = await db.Pedidos.AsNoTracking()
            .Include(p => p.Cliente)
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .Where(p => p.Habilitado)
            .ToListAsync();

        var resultado = new List<object>();
        foreach (var pedido in pedidos)
        {
            foreach (var detalle in pedido.Detalles)
            {
                if (detalle.Estado is not ("PENDIENTE" or "EN_CONFECCION"))
                {
                    continue;
                }
                if (detalle.Producto is null ||
                    !detalle.Producto.RequiereConfeccion ||
                    !detalle.Producto.Habilitado)
                {
                    continue;
                }

                resultado.Add(new
                {
                    id = $"pending_{pedido.Id}_{detalle.Id}",
                    pedidoId = pedido.Id,
                    detallePedidoId = detalle.Id,
                    productoId = detalle.ProductoId,
                    cantidad = detalle.Cantidad,
                    estado = detalle.Estado ?? "PENDIENTE",
                    fechaInicio = (string?)null,
                    fechaFin = (string?)null,
                    observaciones = $"Pendiente para el pedido {pedido.Numero}",
                    pedido = pedido.ToPedidoConCliente(),
                    producto = detalle.Producto.ToDto()
                });
            }
        }

        return Ok(resultado);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await ConIncludes(db.ItemsProduccion.AsNoTracking().AsQueryable())
            .FirstOrDefaultAsync(i => i.Id == id);
        if (item is null)
        {
            return NotFound(new { error = "Item de producción no encontrado" });
        }
        return Ok(item.ToDto(conAnidamiento: true));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            var b = new JsonBody(body);
            var item = new ItemProduccion { Id = b.Entero("id") ?? 0, Habilitado = true };
            AplicarWhitelist(item, b);

            db.ItemsProduccion.Add(item);
            await db.SaveChangesAsync();

            var creado = await ConIncludes(db.ItemsProduccion.AsNoTracking().AsQueryable())
                .FirstAsync(i => i.Id == item.Id);
            return Ok(creado.ToDto(conAnidamiento: true));
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
        var item = await db.ItemsProduccion.FindAsync(id);
        if (item is null)
        {
            return NotFound(new { error = "Item de producción no encontrado" });
        }

        try
        {
            AplicarWhitelist(item, new JsonBody(body));
            await db.SaveChangesAsync();

            var actualizado = await ConIncludes(db.ItemsProduccion.AsNoTracking().AsQueryable())
                .FirstAsync(i => i.Id == id);
            return Ok(actualizado.ToDto(conAnidamiento: true));
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

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Patch(int id, [FromBody] JsonElement body)
    {
        var item = await db.ItemsProduccion.FindAsync(id);
        if (item is null)
        {
            return NotFound(new { error = "Item de producción no encontrado" });
        }

        try
        {
            AplicarWhitelist(item, new JsonBody(body));
            await db.SaveChangesAsync();

            var actualizado = await ConIncludes(db.ItemsProduccion.AsNoTracking().AsQueryable())
                .FirstAsync(i => i.Id == id);
            return Ok(actualizado.ToDto(conAnidamiento: true));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.ItemsProduccion.FindAsync(id);
        if (item is null)
        {
            return NotFound(new { error = "Item de producción no encontrado" });
        }

        try
        {
            item.Habilitado = false;
            await db.SaveChangesAsync();
            return Ok(new { message = "Item deshabilitado", item = item.ToDto() });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }
}
