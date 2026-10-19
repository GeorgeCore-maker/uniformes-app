using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Uniformes.Api.Entities;

namespace Uniformes.Api.Data;

public class UniformesDbContext(DbContextOptions<UniformesDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<DetallePedido> DetallePedidos => Set<DetallePedido>();
    public DbSet<ItemProduccion> ItemsProduccion => Set<ItemProduccion>();
    public DbSet<Rol> Roles => Set<Rol>();

    private static readonly DateTime UnixEpoch = new(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    private static readonly ValueConverter<DateTime, long> FechaEpochMs = new(
        v => (long)(ToUtc(v) - UnixEpoch).TotalMilliseconds,
        v => UnixEpoch.AddMilliseconds(v));

    private static DateTime ToUtc(DateTime dt) => dt.Kind switch
    {
        DateTimeKind.Utc => dt,
        DateTimeKind.Local => dt.ToUniversalTime(),
        _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
    };

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.Property(x => x.Username).IsRequired();
            e.Property(x => x.Password).IsRequired();
            e.Property(x => x.Role).IsRequired();
            e.HasIndex(x => x.Username).IsUnique();
        });

        modelBuilder.Entity<Cliente>(e =>
        {
            e.Property(x => x.Nombre).IsRequired();
            e.Property(x => x.Telefono).IsRequired();
            e.Property(x => x.Nit).IsRequired();
            e.HasIndex(x => x.Nit).IsUnique();
        });

        modelBuilder.Entity<Categoria>(e =>
        {
            e.Property(x => x.Nombre).IsRequired();
        });

        modelBuilder.Entity<Producto>(e =>
        {
            e.Property(x => x.Nombre).IsRequired();
            e.Property(x => x.Categoria).IsRequired();
        });

        modelBuilder.Entity<Pedido>(e =>
        {
            e.Property(x => x.Numero).IsRequired();
            e.HasIndex(x => x.Numero).IsUnique();
            e.HasOne(x => x.Cliente)
                .WithMany(c => c.Pedidos)
                .HasForeignKey(x => x.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.Detalles)
                .WithOne(x => x.Pedido)
                .HasForeignKey(x => x.PedidoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DetallePedido>(e =>
        {
            e.Property(x => x.PrecioUnitario).IsRequired();
            e.Property(x => x.Estado).HasDefaultValue("PENDIENTE");
            e.HasOne(x => x.Producto)
                .WithMany(x => x.DetallesPedido)
                .HasForeignKey(x => x.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.ItemsProduccion)
                .WithOne(x => x.Detalle)
                .HasForeignKey(x => x.DetalleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ItemProduccion>(e =>
        {
            e.HasOne(x => x.Producto)
                .WithMany(x => x.ItemsProduccion)
                .HasForeignKey(x => x.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Rol>(e =>
        {
            e.Property(x => x.Nombre).IsRequired();
            e.Property(x => x.Permisos).IsRequired();
        });

        // Prisma creó las tablas con nombres de columna camelCase (clienteId, createdAt...).
        // EF usa PascalCase por convención; se re-mapea toda la capa de propiedades.
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                var columna = char.ToLowerInvariant(property.Name[0]) + property.Name[1..];
                property.SetColumnName(columna);
            }
        }

        // Prisma guarda DateTime como milisegundos desde epoch en SQLite.
        // Se aplica a todas las propiedades DateTime para mantener compatibilidad.
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                var tipo = Nullable.GetUnderlyingType(property.ClrType) ?? property.ClrType;
                if (tipo == typeof(DateTime))
                {
                    property.SetValueConverter(FechaEpochMs);
                }
            }
        }
    }
}
