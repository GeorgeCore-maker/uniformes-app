using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Uniformes.Api.Entities;

[Table("productos")]
public class Producto
{
    [Key]
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string? Descripcion { get; set; }
    public string Categoria { get; set; } = "";
    public string? Talla { get; set; }
    public double Precio { get; set; }
    public double? Costo { get; set; }
    public int Stock { get; set; }
    public int StockMinimo { get; set; } = 5;
    public bool RequiereConfeccion { get; set; }
    public bool Habilitado { get; set; } = true;
    public DateTime? FechaDeshabilitado { get; set; }

    public List<DetallePedido> DetallesPedido { get; set; } = [];
    public List<ItemProduccion> ItemsProduccion { get; set; } = [];
}
