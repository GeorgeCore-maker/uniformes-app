using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Uniformes.Api.Data;

public static class DbInitializer
{
    public static void Initialize(IServiceProvider servicios)
    {
        using var scope = servicios.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<UniformesDbContext>();

        db.Database.OpenConnection();
        db.Database.ExecuteSqlRaw("SELECT 1");

        AsegurarColumnaEmail(db);
        SembrarRolesBase(db);
    }

    private static void AsegurarColumnaEmail(UniformesDbContext db)
    {
        var conexion = db.Database.GetDbConnection();
        using var comando = conexion.CreateCommand();
        comando.CommandText = "PRAGMA table_info(users)";
        using var lector = comando.ExecuteReader();

        var columnas = new List<string>();
        while (lector.Read())
        {
            columnas.Add(lector.GetString(1));
        }
        lector.Close();

        if (!columnas.Contains("email"))
        {
            db.Database.ExecuteSqlRaw("ALTER TABLE users ADD COLUMN email TEXT");
        }
    }

    private static void SembrarRolesBase(UniformesDbContext db)
    {
        var baseRoles = new[]
        {
            new
            {
                Nombre = "ADMIN",
                Descripcion = "Administrador del sistema",
                Permisos = JsonSerializer.Serialize(new[]
                {
                    "usuarios.crear", "usuarios.editar", "usuarios.eliminar",
                    "pedidos.crear", "pedidos.editar", "productos.crear", "productos.editar",
                    "reportes.ver"
                })
            },
            new
            {
                Nombre = "VENDEDOR",
                Descripcion = "Vendedor",
                Permisos = JsonSerializer.Serialize(new[]
                {
                    "pedidos.crear", "pedidos.editar", "clientes.crear", "clientes.editar",
                    "productos.ver"
                })
            },
            new
            {
                Nombre = "OPERARIO",
                Descripcion = "Operario de producción",
                Permisos = JsonSerializer.Serialize(new[]
                {
                    "produccion.ver", "produccion.editar", "inventario.ver"
                })
            }
        };

        foreach (var rol in baseRoles)
        {
            if (!db.Roles.Any(r => r.Nombre == rol.Nombre))
            {
                db.Roles.Add(new Entities.Rol
                {
                    Nombre = rol.Nombre,
                    Descripcion = rol.Descripcion,
                    Permisos = rol.Permisos,
                    Activo = true,
                    Habilitado = true
                });
            }
        }

        db.SaveChanges();
    }
}
