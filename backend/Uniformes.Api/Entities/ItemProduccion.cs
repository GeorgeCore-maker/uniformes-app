using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Uniformes.Api.Entities;

[Table("items_produccion")]
public class ItemProduccion
{
    [Key]
    public int Id { get; set; }
    public int DetalleId { get; set; }
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public DateTime? FechaInicio { get; set; }
    public string? Observaciones { get; set; }
    public bool Habilitado { get; set; } = true;
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public DetallePedido Detalle { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
}
