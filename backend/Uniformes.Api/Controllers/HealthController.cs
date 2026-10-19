using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uniformes.Api.Data;

namespace Uniformes.Api.Controllers;

[ApiController]
[Route("api/health")]
[AllowAnonymous]
public class HealthController(UniformesDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync("SELECT 1");
            return Ok(new
            {
                status = "ok",
                database = "sqlite",
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                prisma = "connected"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                status = "error",
                database = "sqlite",
                error = ex.Message
            });
        }
    }
}
