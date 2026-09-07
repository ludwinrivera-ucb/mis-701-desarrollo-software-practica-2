using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdeasRestApi.Models;

[Table("Sales")]
public class Sale
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ProductId { get; set; }

    [ForeignKey(nameof(ProductId))]
    public Product? Product { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Total { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;

    [MaxLength(20)]
    public string Status { get; set; } = "ok"; // "ok", "warn", "danger"

    [MaxLength(50)]
    public string StatusLabel { get; set; } = "Pagado";

    [MaxLength(150)]
    public string Customer { get; set; } = string.Empty;

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "efectivo"; // "efectivo", "qr", "tarjeta"

    [MaxLength(500)]
    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
