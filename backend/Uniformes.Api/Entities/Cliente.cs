using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Uniformes.Api.Entities;

[Table("clientes")]
public class Cliente
{
    [Key]
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Telefono { get; set; } = "";
    public string? Email { get; set; }
    public string? Direccion { get; set; }
    public string? Ciudad { get; set; }
    public string Nit { get; set; } = "";
    public bool Habilitado { get; set; } = true;
    public DateTime? FechaDeshabilitado { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<Pedido> Pedidos { get; set; } = [];
}
