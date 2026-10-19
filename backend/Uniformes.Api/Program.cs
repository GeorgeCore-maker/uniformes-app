using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Uniformes.Api.Auth;
using Uniformes.Api.Data;
using Uniformes.Api.Json;
using Uniformes.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Secreto JWT compartido: si falta, se genera una vez y se reinyecta en la
// configuración para que TokenService y JwtBearer usen exactamente la misma clave.
if (string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Secret"]))
{
    if (!builder.Environment.IsDevelopment())
    {
        throw new InvalidOperationException("Jwt:Secret es obligatorio fuera de Development.");
    }

    var temporal = new byte[64];
    Random.Shared.NextBytes(temporal);
    builder.Configuration["Jwt:Secret"] = Convert.ToBase64String(temporal);
    Console.WriteLine("[WARN] Jwt:Secret no configurado; se usa una clave efímera (los tokens morirán al reiniciar).");
}

builder.Services.AddControllers().AddJsonOptions(opciones =>
{
    opciones.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    opciones.JsonSerializerOptions.Converters.Add(new LenientDateTimeConverter());
    opciones.JsonSerializerOptions.Converters.Add(new LenientNullableDateTimeConverter());
});

builder.Services.AddEndpointsApiExplorer();

var rutaDb = DbPathResolver.Resolve(builder.Configuration);
builder.Services.AddDbContext<UniformesDbContext>(opciones =>
    opciones.UseSqlite($"Data Source={rutaDb}"));

builder.Services.AddSingleton<TokenService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opciones =>
    {
        opciones.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "uniformes-app",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "uniformes-app-front",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization(opciones =>
{
    opciones.AddPolicy("Admin", politica => politica.RequireRole("ADMIN"));
    opciones.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

var origenes = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? ["http://localhost:4200"];
builder.Services.AddCors(opciones => opciones.AddPolicy("Frontend", politica => politica
    .WithOrigins(origenes)
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

DbInitializer.Initialize(app.Services);

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
