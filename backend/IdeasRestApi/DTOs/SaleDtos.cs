using System.ComponentModel.DataAnnotations;

namespace IdeasRestApi.DTOs;

public class SaleDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public DateTime Date { get; set; }
    public string FormattedDate { get; set; } = string.Empty;
    public string Status { get; set; } = "ok";
    public string StatusLabel { get; set; } = "Pagado";
    public string Customer { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateSaleDto
{
    [Required(ErrorMessage = "El ID del producto es obligatorio")]
    public int ProductId { get; set; }

    [Required(ErrorMessage = "La cantidad es obligatoria")]
    [Range(1, 10000, ErrorMessage = "La cantidad debe ser al menos 1")]
    public int Quantity { get; set; }

    [Range(0, 1000000, ErrorMessage = "El precio unitario no puede ser negativo")]
    public decimal? UnitPrice { get; set; }

    public DateTime? Date { get; set; }

    public string? Status { get; set; } = "ok"; // "ok", "warn", "danger"

    public string? StatusLabel { get; set; }

    public string? Customer { get; set; }

    public string? PaymentMethod { get; set; } = "efectivo"; // "efectivo", "qr", "tarjeta"

    public string? Notes { get; set; }
}

public class UpdateSaleDto
{
    [Required(ErrorMessage = "El ID del producto es obligatorio")]
    public int ProductId { get; set; }

    [Required(ErrorMessage = "La cantidad es obligatoria")]
    [Range(1, 10000, ErrorMessage = "La cantidad debe ser al menos 1")]
    public int Quantity { get; set; }

    [Required(ErrorMessage = "El precio unitario es obligatorio")]
    [Range(0, 1000000, ErrorMessage = "El precio unitario no puede ser negativo")]
    public decimal UnitPrice { get; set; }

    public DateTime? Date { get; set; }

    public string? Status { get; set; } = "ok";

    public string? StatusLabel { get; set; }

    public string? Customer { get; set; }

    public string? PaymentMethod { get; set; } = "efectivo";

    public string? Notes { get; set; }
}
