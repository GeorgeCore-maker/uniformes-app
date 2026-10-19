using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uniformes.Api.Data;
using Uniformes.Api.Dtos;
using Uniformes.Api.Entities;
using Uniformes.Api.Infrastructure;

namespace Uniformes.Api.Controllers;

[ApiController]
[Route("api/inventario")]
[Authorize(Policy = "Admin")]
public class InventarioController(UniformesDbContext db) : ControllerBase
{
    private static string CalcularEstado(Producto p) =>
        p.Stock <= 0 ? "CRÍTICO" : p.Stock <= p.StockMinimo ? "BAJO" : "NORMAL";

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var q = db.Productos.AsNoTracking().AsQueryable();
        if (!Filtro.IncluirDeshabilitados(Request.Query))
        {
            q = q.Where(p => p.Habilitado);
        }

        var productos = await q.OrderBy(p => p.Nombre).ToListAsync();
        return Ok(productos.Select(p => p.ToDto(estado: CalcularEstado(p))));
    }
}
