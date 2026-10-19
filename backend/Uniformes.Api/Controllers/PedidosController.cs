using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uniformes.Api.Data;
using Uniformes.Api.Dtos;
using Uniformes.Api.Entities;
using Uniformes.Api.Infrastructure;

namespace Uniformes.Api.Controllers;

[ApiController]
[Route("api/pedidos")]
public class PedidosController(UniformesDbContext db) : ControllerBase
{
    private static IQueryable<Pedido> ConIncludes(IQueryable<Pedido> q) =>
        q.Include(p => p.Cliente)
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .Include(p => p.Detalles).ThenInclude(d => d.ItemsProduccion).ThenInclude(i => i.Producto);

    private static IQueryable<Pedido> ConIncludesBasicos(IQueryable<Pedido> q) =>
        q.Include(p => p.Cliente)
            .Include(p => p.Detalles);

    private static IQueryable<Pedido> Filtrar(IQueryable<Pedido> q, IQueryCollection query)
    {
        if (!Filtro.IncluirDeshabilitados(query))
        {
            var habilitado = Filtro.Habilitado(query);
            q = habilitado is null
                ? q.Where(p => p.Habilitado)
                : q.Where(p => p.Habilitado == habilitado.Value);
        }

        var clienteId = Filtro.Entero(query, "clienteId");
        if (clienteId is not null)
        {
            q = q.Where(p => p.ClienteId == clienteId.Value);
        }

        var estado = Filtro.Texto(query, "estado");
        if (!string.IsNullOrWhiteSpace(estado))
        {
            q = q.Where(p => p.Detalles.Any(d => d.Estado == estado));
        }

        return q;
    }

    private static IQueryable<Pedido> Buscar(IQueryable<Pedido> q, IQueryCollection query)
    {
        var termino = Filtro.Texto(query, "buscar");
        if (string.IsNullOrWhiteSpace(termino))
        {
            return q;
        }

        var t = termino.ToLower();
        var campos = Filtro.Campos(query);
        var usarNumero = Filtro.Usa(campos, "numero");
        var usarObservaciones = Filtro.Usa(campos, "observaciones");

        return q.Where(p =>
            (usarNumero && p.Numero.ToLower().Contains(t)) ||
            (usarObservaciones && p.Observaciones != null && p.Observaciones.ToLower().Contains(t)));
    }

    private static string PrecioUnitario(JsonElement? crudo) => crudo switch
    {
        null => "0",
        { ValueKind: JsonValueKind.String } e => e.GetString() ?? "0",
        { ValueKind: JsonValueKind.Number } e => e.GetRawText(),
        _ => "0"
    };

    private static DetallePedido CrearDetalle(JsonBody d) => new()
    {
        Id = d.Entero("id") ?? 0,
        ProductoId = d.Entero("productoId") ?? 0,
        Cantidad = d.Entero("cantidad") ?? 0,
        PrecioUnitario = PrecioUnitario(d.Crudo("precioUnitario")),
        Subtotal = d.Doble("subtotal"),
        Estado = d.Cadena("estado") ?? "PENDIENTE"
    };

    private static void AplicarPedido(Pedido pedido, JsonBody b)
    {
        if (b.Entero("clienteId") is int clienteId) pedido.ClienteId = clienteId;
        if (b.NoNulo("numero")) pedido.Numero = b.Cadena("numero")!;
        if (b.NoNulo("incluirIva")) pedido.IncluirIva = b.Bool("incluirIva");
        if (b.Doble("subtotal") is double subtotal) pedido.Subtotal = subtotal;
        if (b.Presente("impuesto")) pedido.Impuesto = b.Doble("impuesto");
        if (b.Doble("total") is double total) pedido.Total = total;
        if (b.Presente("margen")) pedido.Margen = b.Doble("margen");
        if (b.NoNulo("fechaCreacion")) pedido.FechaCreacion = b.Cadena("fechaCreacion");
        if (b.NoNulo("observaciones")) pedido.Observaciones = b.Cadena("observaciones");
        if (b.NoNulo("habilitado")) pedido.Habilitado = b.Bool("habilitado") ?? pedido.Habilitado;
        if (b.Presente("fechaDeshabilitado")) pedido.FechaDeshabilitado = b.Fecha("fechaDeshabilitado");
        if (b.NoNulo("crearItemsProduccion")) pedido.CrearItemsProduccion = b.Bool("crearItemsProduccion");
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var q = Filtrar(db.Pedidos.AsNoTracking().AsQueryable(), Request.Query);
        var pedidos = await ConIncludes(q).OrderByDescending(p => p.Id).ToListAsync();
        return Ok(pedidos.Select(p => p.ToDto(conDetalles: true, conItemsEnDetalles: true)));
    }

    [HttpGet("paginado")]
    public async Task<IActionResult> GetPaginado()
    {
        var q = Buscar(Filtrar(db.Pedidos.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var total = await q.CountAsync();
        var pagina = Filtro.Pagina(Request.Query);
        var limite = Filtro.Limite(Request.Query);
        var data = await ConIncludes(q).OrderByDescending(p => p.Id)
            .Skip((pagina - 1) * limite).Take(limite).ToListAsync();
        return Ok(new { data = data.Select(p => p.ToDto(conDetalles: true, conItemsEnDetalles: true)).ToList(), total, pagina, limite });
    }

    [HttpGet("buscar")]
    public async Task<IActionResult> GetBuscar()
    {
        var q = Buscar(Filtrar(db.Pedidos.AsNoTracking().AsQueryable(), Request.Query), Request.Query);
        var pedidos = await ConIncludes(q).OrderByDescending(p => p.Id).ToListAsync();
        return Ok(pedidos.Select(p => p.ToDto(conDetalles: true, conItemsEnDetalles: true)));
    }

    [HttpGet("conteo")]
    public async Task<IActionResult> GetConteo()
    {
        var q = Filtrar(db.Pedidos.AsNoTracking().AsQueryable(), Request.Query);
        return Ok(new { conteo = await q.CountAsync() });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var pedido = await ConIncludes(db.Pedidos.AsNoTracking().AsQueryable())
            .FirstOrDefaultAsync(p => p.Id == id);
        if (pedido is null)
        {
            return NotFound(new { error = "Pedido no encontrado" });
        }
        return Ok(pedido.ToDto(conDetalles: true, conItemsEnDetalles: true));
    }

    [HttpGet("{pedidoId:int}/detalles")]
    public async Task<IActionResult> GetDetalles(int pedidoId)
    {
        var detalles = await db.DetallePedidos.AsNoTracking()
            .Where(d => d.PedidoId == pedidoId)
            .OrderBy(d => d.Id)
            .ToListAsync();
        return Ok(detalles.Select(d => d.ToDto()));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body)
    {
        try
        {
            var b = new JsonBody(body);
            var pedido = new Pedido
            {
                Id = b.Entero("id") ?? 0,
                ClienteId = b.Entero("clienteId") ?? 0,
                Numero = b.Cadena("numero") ?? "",
                IncluirIva = b.Bool("incluirIva"),
                Subtotal = b.Doble("subtotal") ?? 0,
                Impuesto = b.Doble("impuesto"),
                Total = b.Doble("total") ?? 0,
                Margen = b.Doble("margen"),
                FechaCreacion = b.Cadena("fechaCreacion"),
                Observaciones = b.Cadena("observaciones"),
                CrearItemsProduccion = b.Bool("crearItemsProduccion"),
                Habilitado = true
            };

            if (b.IntentarArreglo("detalles", out var detalles) &&
                detalles.GetArrayLength() > 0)
            {
                foreach (var crudo in detalles.EnumerateArray())
                {
                    pedido.Detalles.Add(CrearDetalle(new JsonBody(crudo)));
                }
            }

            db.Pedidos.Add(pedido);
            await db.SaveChangesAsync();

            var creado = await ConIncludesBasicos(db.Pedidos.AsNoTracking().AsQueryable())
                .FirstAsync(p => p.Id == pedido.Id);
            return Ok(creado.ToDto(conDetalles: true));
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
        var pedido = await db.Pedidos.Include(p => p.Detalles).FirstOrDefaultAsync(p => p.Id == id);
        if (pedido is null)
        {
            return NotFound(new { error = "Pedido no encontrado" });
        }

        try
        {
            var b = new JsonBody(body);
            var hayDetalles = b.IntentarArreglo("detalles", out var detalles) &&
                              detalles.GetArrayLength() > 0;

            if (hayDetalles)
            {
                await using var transaccion = await db.Database.BeginTransactionAsync();

                var idsAntiguos = pedido.Detalles.Select(d => d.Id).ToList();
                if (idsAntiguos.Count > 0)
                {
                    await db.ItemsProduccion
                        .Where(i => idsAntiguos.Contains(i.DetalleId))
                        .ExecuteDeleteAsync();
                }
                await db.DetallePedidos.Where(d => d.PedidoId == id).ExecuteDeleteAsync();
                db.ChangeTracker.Clear();

                // Re-traer el pedido: Clear() descartó la entidad con la whitelist aplicada.
                pedido = await db.Pedidos.FirstAsync(p => p.Id == id);
                AplicarPedido(pedido, b);

                var nuevos = new List<DetallePedido>();
                foreach (var crudo in detalles.EnumerateArray())
                {
                    var detalle = CrearDetalle(new JsonBody(crudo));
                    detalle.PedidoId = pedido.Id;
                    nuevos.Add(detalle);
                }
                db.DetallePedidos.AddRange(nuevos);
                await db.SaveChangesAsync();

                var productoIds = nuevos.Select(d => d.ProductoId).Distinct().ToList();
                var productos = await db.Productos.AsNoTracking()
                    .Where(p => productoIds.Contains(p.Id))
                    .ToDictionaryAsync(p => p.Id);

                foreach (var detalle in nuevos)
                {
                    if (productos.TryGetValue(detalle.ProductoId, out var producto) &&
                        producto.RequiereConfeccion)
                    {
                        db.ItemsProduccion.Add(new ItemProduccion
                        {
                            DetalleId = detalle.Id,
                            ProductoId = detalle.ProductoId,
                            Cantidad = detalle.Cantidad,
                            FechaInicio = DateTime.UtcNow,
                            Habilitado = true
                        });
                    }
                }
                await db.SaveChangesAsync();

                await transaccion.CommitAsync();
            }
            else
            {
                AplicarPedido(pedido, b);
                await db.SaveChangesAsync();
            }

            var resultado = await ConIncludesBasicos(db.Pedidos.AsNoTracking().AsQueryable())
                .FirstAsync(p => p.Id == id);
            return Ok(resultado.ToDto(conDetalles: true));
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
        var pedido = await db.Pedidos.FindAsync(id);
        if (pedido is null)
        {
            return NotFound(new { error = "Pedido no encontrado" });
        }

        try
        {
            AplicarPedido(pedido, new JsonBody(body));
            pedido.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            var resultado = await ConIncludesBasicos(db.Pedidos.AsNoTracking().AsQueryable())
                .FirstAsync(p => p.Id == id);
            return Ok(resultado.ToDto(conDetalles: true));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var pedido = await db.Pedidos.FindAsync(id);
        if (pedido is null)
        {
            return NotFound(new { error = "Pedido no encontrado" });
        }

        try
        {
            pedido.Habilitado = false;
            pedido.FechaDeshabilitado = DateTime.UtcNow;
            pedido.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Ok(new { message = "Pedido deshabilitado", pedido = pedido.ToDto() });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpPut("{pedidoId:int}/detalles/{detalleId:int}")]
    public async Task<IActionResult> UpdateDetalle(int pedidoId, int detalleId, [FromBody] JsonElement body)
    {
        var detalle = await db.DetallePedidos
            .FirstOrDefaultAsync(d => d.Id == detalleId && d.PedidoId == pedidoId);
        if (detalle is null)
        {
            return NotFound(new { error = "Detalle no encontrado" });
        }

        try
        {
            var b = new JsonBody(body);
            if (b.Entero("productoId") is int productoId) detalle.ProductoId = productoId;
            if (b.Entero("cantidad") is int cantidad) detalle.Cantidad = cantidad;
            if (b.Presente("precioUnitario")) detalle.PrecioUnitario = PrecioUnitario(b.Crudo("precioUnitario"));
            if (b.Doble("subtotal") is double subtotal) detalle.Subtotal = subtotal;
            if (b.NoNulo("estado")) detalle.Estado = b.Cadena("estado")!;

            await db.SaveChangesAsync();
            return Ok(detalle.ToDto());
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }
}
