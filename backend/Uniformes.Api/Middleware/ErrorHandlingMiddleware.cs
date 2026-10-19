using System.Text.Json;

namespace Uniformes.Api.Middleware;

/// <summary>
/// Errores no controlados → 500 con { error: mensaje }, igual que el backend Express legacy.
/// </summary>
public class ErrorHandlingMiddleware(RequestDelegate siguiente, ILogger<ErrorHandlingMiddleware> log)
{
    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await siguiente(contexto);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Error no controlado en {Method} {Path}",
                contexto.Request.Method, contexto.Request.Path);

            if (contexto.Response.HasStarted)
            {
                throw;
            }

            contexto.Response.Clear();
            contexto.Response.StatusCode = StatusCodes.Status500InternalServerError;
            contexto.Response.ContentType = "application/json; charset=utf-8";
            await contexto.Response.WriteAsync(
                JsonSerializer.Serialize(new { error = ex.Message }));
        }
    }
}
