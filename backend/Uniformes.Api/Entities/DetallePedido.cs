using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Uniformes.Api.Entities;

[Table("detalle_pedidos")]
public class DetallePedido
{
    [Key]
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public string PrecioUnitario { get; set; } = "0";
    public double? Subtotal { get; set; }
    public string Estado { get; set; } = "PENDIENTE";

    public Pedido Pedido { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
    public List<ItemProduccion> ItemsProduccion { get; set; } = [];
}
