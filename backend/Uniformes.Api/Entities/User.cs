using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Uniformes.Api.Entities;

[Table("users")]
public class User
{
    [Key]
    public long Id { get; set; }
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "";
    public bool Activo { get; set; } = true;
    public string? Token { get; set; }
    public bool Habilitado { get; set; } = true;
    public DateTime? FechaDeshabilitado { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Email { get; set; }
}
