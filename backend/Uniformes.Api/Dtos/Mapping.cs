using System.Text.Json;
using Uniformes.Api.Entities;

namespace Uniformes.Api.Dtos;

public static class Mapping
{
    public static UserDto ToDto(this User u) =>
        new(u.Id, u.Username, u.Role, u.Activo, u.Habilitado,
            u.FechaDeshabilitado, u.CreatedAt, u.UpdatedAt, u.Email);

    public static ClienteDto ToDto(this Cliente c) =>
        new(c.Id, c.Nombre, c.Telefono, c.Email, c.Direccion, c.Ciudad, c.Nit,
            c.Habilitado, c.FechaDeshabilitado, c.CreatedAt, c.UpdatedAt);

    public static CategoriaDto ToDto(this Categoria c) =>
        new(c.Id, c.Nombre, c.Descripcion, c.Habilitado,
            c.FechaDeshabilitado, c.CreatedAt, c.UpdatedAt);

    public static ProductoDto ToDto(this Producto p, string? estado = null) =>
        new(p.Id, p.Nombre, p.Descripcion, p.Categoria, p.Talla, p.Precio, p.Costo,
            p.Stock, p.StockMinimo, p.RequiereConfeccion, p.Habilitado,
            p.FechaDeshabilitado, estado);

    public static RolDto ToDto(this Rol r) =>
        new(r.Id, r.Nombre, r.Descripcion, ParsearPermisos(r.Permisos),
            r.Activo, r.Habilitado, r.FechaDeshabilitado, r.CreatedAt, r.UpdatedAt);

    public static DetalleDto ToDto(this DetallePedido d, bool conProducto = false, bool conItems = false) =>
        new(d.Id, d.PedidoId, d.ProductoId, d.Cantidad, d.PrecioUnitario, d.Subtotal, d.Estado,
            conProducto && d.Producto is not null ? d.Producto.ToDto() : null,
            conItems && d.ItemsProduccion is not null
                ? d.ItemsProduccion.Select(i => i.ToDto()).ToList()
                : null);

    public static PedidoDto ToDto(this Pedido p, bool conDetalles = false, bool conItemsEnDetalles = false) =>
        new(p.Id, p.ClienteId, p.Numero, p.IncluirIva, p.Subtotal, p.Impuesto, p.Total,
            p.Margen, p.FechaCreacion, p.Observaciones, p.Habilitado, p.FechaDeshabilitado,
            p.CrearItemsProduccion, p.CreatedAt, p.UpdatedAt,
            p.Cliente is not null ? p.Cliente.ToDto() : null,
            conDetalles
                ? p.Detalles.Select(d => d.ToDto(conProducto: true, conItems: conItemsEnDetalles)).ToList()
                : null);

    public static PedidoConClienteDto ToPedidoConCliente(this Pedido p) =>
        new(p.Id, p.ClienteId, p.Numero, p.IncluirIva, p.Subtotal, p.Impuesto, p.Total,
            p.Margen, p.FechaCreacion, p.Observaciones, p.Habilitado, p.FechaDeshabilitado,
            p.CrearItemsProduccion, p.CreatedAt, p.UpdatedAt,
            p.Cliente is not null ? p.Cliente.ToDto() : null);

    public static DetalleAnidadoDto ToDetalleAnidado(this DetallePedido d) =>
        new(d.Id, d.PedidoId, d.ProductoId, d.Cantidad, d.PrecioUnitario, d.Subtotal, d.Estado,
            d.Pedido is not null ? d.Pedido.ToPedidoConCliente() : null,
            d.Producto is not null ? d.Producto.ToDto() : null);

    public static ItemProduccionDto ToDto(this ItemProduccion i, bool conAnidamiento = false)
    {
        var pedido = conAnidamiento ? i.Detalle?.Pedido : null;
        return new ItemProduccionDto(
            i.Id, i.DetalleId, i.ProductoId, i.Cantidad, i.FechaInicio, i.Observaciones,
            i.Habilitado, i.CreatedAt, i.UpdatedAt,
            conAnidamiento && i.Producto is not null ? i.Producto.ToDto() : null,
            conAnidamiento && i.Detalle is not null ? i.Detalle.ToDetalleAnidado() : null,
            conAnidamiento ? pedido?.Numero ?? "N/A" : null,
            conAnidamiento ? pedido?.FechaCreacion : null,
            conAnidamiento && pedido?.Cliente is not null ? pedido.Cliente.ToDto() : null);
    }

    private static string[] ParsearPermisos(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                return doc.RootElement.EnumerateArray()
                    .Select(e => e.ToString())
                    .ToArray();
            }
        }
        catch (JsonException)
        {
        }

        return [];
    }
}
