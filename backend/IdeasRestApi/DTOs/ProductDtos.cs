using System.ComponentModel.DataAnnotations;

namespace IdeasRestApi.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string CategoryLabel { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int MinStock { get; set; }
    public string Description { get; set; } = string.Empty;
    public string StockStatus { get; set; } = "Disponible"; // "Disponible", "Stock bajo", "Agotado"
    public string StockStatusClass { get; set; } = "ok"; // "ok", "warn", "danger"
    public DateTime CreatedAt { get; set; }
}

public class CreateProductDto
{
    [Required(ErrorMessage = "El nombre del producto es obligatorio")]
    [MaxLength(200, ErrorMessage = "El nombre no puede exceder 200 caracteres")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es obligatoria")]
    public string Category { get; set; } = string.Empty;

    public string? CategoryLabel { get; set; }

    public string? Brand { get; set; }

    public string? Sku { get; set; }

    [Required(ErrorMessage = "El precio es obligatorio")]
    [Range(0, 1000000, ErrorMessage = "El precio debe ser mayor o igual a 0")]
    public decimal Price { get; set; }

    [Required(ErrorMessage = "El stock inicial es obligatorio")]
    [Range(0, 100000, ErrorMessage = "El stock debe ser mayor o igual a 0")]
    public int Stock { get; set; }

    [Range(0, 1000, ErrorMessage = "El stock mínimo debe ser mayor o igual a 0")]
    public int MinStock { get; set; } = 5;

    public string? Description { get; set; }
}

public class UpdateProductDto : CreateProductDto
{
}
