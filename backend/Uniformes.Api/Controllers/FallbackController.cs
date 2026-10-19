using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Uniformes.Api.Controllers;

[Route("")]
public class FallbackController : ControllerBase
{
    [HttpGet("{*ruta}")]
    [HttpPost("{*ruta}")]
    [HttpPut("{*ruta}")]
    [HttpPatch("{*ruta}")]
    [HttpDelete("{*ruta}")]
    [AllowAnonymous]
    public IActionResult NoEncontrado() => NotFound(new
    {
        error = "Ruta no encontrada",
        available_routes = new[]
        {
            "GET /api/health - Estado del servidor",
            "POST /api/auth/login - Autenticación",
            "GET /api/users - Usuarios (CRUD completo)",
            "GET /api/clientes - Clientes (CRUD completo)",
            "GET /api/categorias - Categorías (CRUD completo)",
            "GET /api/roles - Roles (CRUD completo)",
            "GET /api/productos - Productos (CRUD completo)",
            "GET /api/pedidos - Pedidos (CRUD completo)",
            "GET /api/inventario - Inventario",
            "GET /api/produccion - Producción (CRUD completo)"
        }
    });
}
