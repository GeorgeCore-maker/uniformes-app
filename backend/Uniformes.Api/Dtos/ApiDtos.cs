using System.Text.Json.Serialization;

namespace Uniformes.Api.Dtos;

// Los nav (colecciones/relaciones) se omiten del JSON cuando están en null,
// igual que Prisma omite los includes no solicitados.

public record UserDto(
    long Id,
    string Username,
    string Role,
    bool Activo,
    bool Habilitado,
    DateTime? FechaDeshabilitado,
    DateTime? CreatedAt,
    DateTime? UpdatedAt,
    string? Email);

public record ClienteDto(
    int Id,
    string Nombre,
    string? Telefono,
    string? Email,
    string? Direccion,
    string? Ciudad,
    string? Nit,
    bool Habilitado,
    DateTime? FechaDeshabilitado,
    DateTime? CreatedAt,
    DateTime? UpdatedAt);

public record CategoriaDto(
    int Id,
    string Nombre,
    string? Descripcion,
    bool Habilitado,
    DateTime? FechaDeshabilitado,
    DateTime? CreatedAt,
    DateTime? UpdatedAt);

public record ProductoDto(
    int Id,
    string Nombre,
    string? Descripcion,
    string Categoria,
    string? Talla,
    double Precio,
    double? Costo,
    int Stock,
    int StockMinimo,
    bool RequiereConfeccion,
    bool Habilitado,
    DateTime? FechaDeshabilitado,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? Estado);

public record DetalleDto(
    int Id,
    int PedidoId,
    int ProductoId,
    int Cantidad,
    string PrecioUnitario,
    double? Subtotal,
    string Estado,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] ProductoDto? Producto,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] List<ItemProduccionDto>? ItemsProduccion);

public record PedidoDto(
    int Id,
    int ClienteId,
    string Numero,
    bool? IncluirIva,
    double Subtotal,
    double? Impuesto,
    double Total,
    double? Margen,
    string? FechaCreacion,
    string? Observaciones,
    bool Habilitado,
    DateTime? FechaDeshabilitado,
    bool? CrearItemsProduccion,
    DateTime? CreatedAt,
    DateTime? UpdatedAt,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] ClienteDto? Cliente,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] List<DetalleDto>? Detalles);

public record PedidoConClienteDto(
    int Id,
    int ClienteId,
    string Numero,
    bool? IncluirIva,
    double Subtotal,
    double? Impuesto,
    double Total,
    double? Margen,
    string? FechaCreacion,
    string? Observaciones,
    bool Habilitado,
    DateTime? FechaDeshabilitado,
    bool? CrearItemsProduccion,
    DateTime? CreatedAt,
    DateTime? UpdatedAt,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] ClienteDto? Cliente);

public record DetalleAnidadoDto(
    int Id,
    int PedidoId,
    int ProductoId,
    int Cantidad,
    string PrecioUnitario,
    double? Subtotal,
    string Estado,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] PedidoConClienteDto? Pedido,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] ProductoDto? Producto);

public record ItemProduccionDto(
    int Id,
    int DetalleId,
    int ProductoId,
    int Cantidad,
    DateTime? FechaInicio,
    string? Observaciones,
    bool Habilitado,
    DateTime? CreatedAt,
    DateTime? UpdatedAt,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] ProductoDto? Producto,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] DetalleAnidadoDto? Detalle,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? NumeroPedido,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? FechaPedido,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] ClienteDto? Cliente);

public record RolDto(
    int Id,
    string Nombre,
    string? Descripcion,
    string[] Permisos,
    bool Activo,
    bool Habilitado,
    DateTime? FechaDeshabilitado,
    DateTime? CreatedAt,
    DateTime? UpdatedAt);
