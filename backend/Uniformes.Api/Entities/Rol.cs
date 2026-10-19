using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Uniformes.Api.Entities;

[Table("roles")]
public class Rol
{
    [Key]
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string? Descripcion { get; set; }
    public string Permisos { get; set; } = "[]";
    public bool Activo { get; set; } = true;
    public bool Habilitado { get; set; } = true;
    public DateTime? FechaDeshabilitado { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
