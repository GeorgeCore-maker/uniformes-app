using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Uniformes.Api.Entities;

[Table("pedidos")]
public class Pedido
{
    [Key]
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string Numero { get; set; } = "";
    public bool? IncluirIva { get; set; } = true;
    public double Subtotal { get; set; }
    public double? Impuesto { get; set; } = 0;
    public double Total { get; set; }
    public double? Margen { get; set; } = 0;
    public string? FechaCreacion { get; set; }
    public string? Observaciones { get; set; }
    public bool Habilitado { get; set; } = true;
    public DateTime? FechaDeshabilitado { get; set; }
    public bool? CrearItemsProduccion { get; set; } = false;
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Cliente Cliente { get; set; } = null!;
    public List<DetallePedido> Detalles { get; set; } = [];
}
