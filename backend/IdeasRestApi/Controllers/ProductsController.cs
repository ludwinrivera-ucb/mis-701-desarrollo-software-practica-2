using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IdeasRestApi.Data;
using IdeasRestApi.DTOs;
using IdeasRestApi.Models;

namespace IdeasRestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? category)
    {
        var query = _context.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchLower)
                                  || p.Sku.ToLower().Contains(searchLower)
                                  || p.Brand.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category.ToLower() == category.Trim().ToLower());
        }

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Producto con ID {id} no encontrado." });
        }

        return Ok(MapToDto(product));
    }

    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var product = new Product
        {
            Name = dto.Name.Trim(),
            Category = dto.Category.Trim(),
            CategoryLabel = string.IsNullOrWhiteSpace(dto.CategoryLabel) ? GetCategoryLabel(dto.Category) : dto.CategoryLabel.Trim(),
            Brand = dto.Brand?.Trim() ?? string.Empty,
            Sku = dto.Sku?.Trim() ?? string.Empty,
            Price = dto.Price,
            Stock = dto.Stock,
            MinStock = dto.MinStock > 0 ? dto.MinStock : 5,
            Description = dto.Description?.Trim() ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var resultDto = MapToDto(product);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, resultDto);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Producto con ID {id} no encontrado." });
        }

        product.Name = dto.Name.Trim();
        product.Category = dto.Category.Trim();
        product.CategoryLabel = string.IsNullOrWhiteSpace(dto.CategoryLabel) ? GetCategoryLabel(dto.Category) : dto.CategoryLabel.Trim();
        product.Brand = dto.Brand?.Trim() ?? string.Empty;
        product.Sku = dto.Sku?.Trim() ?? string.Empty;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.MinStock = dto.MinStock > 0 ? dto.MinStock : 5;
        product.Description = dto.Description?.Trim() ?? string.Empty;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(product));
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products
            .Include(p => p.Sales)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new { message = $"Producto con ID {id} no encontrado." });
        }

        if (product.Sales.Any())
        {
            return BadRequest(new
            {
                message = "No se puede eliminar el producto porque tiene ventas asociadas. Elimine o cancele primero las ventas vinculadas."
            });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ProductDto MapToDto(Product product)
    {
        var (status, statusClass) = GetStockStatus(product.Stock, product.MinStock);

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Category = product.Category,
            CategoryLabel = string.IsNullOrWhiteSpace(product.CategoryLabel) ? GetCategoryLabel(product.Category) : product.CategoryLabel,
            Brand = product.Brand,
            Sku = product.Sku,
            Price = product.Price,
            Stock = product.Stock,
            MinStock = product.MinStock,
            Description = product.Description,
            StockStatus = status,
            StockStatusClass = statusClass,
            CreatedAt = product.CreatedAt
        };
    }

    private static (string status, string statusClass) GetStockStatus(int stock, int minStock)
    {
        if (stock <= 0)
        {
            return ("Agotado", "danger");
        }

        if (stock <= minStock)
        {
            return ("Stock bajo", "warn");
        }

        return ("Disponible", "ok");
    }

    private static string GetCategoryLabel(string category) => category.ToLower() switch
    {
        "books" => "Cuadernos y Papelería",
        "pencils" => "Escritura y Colores",
        "paint" => "Arte y Manualidades",
        "geometry" => "Reglas y Geometría",
        "glues" => "Pegamentos y Tijeras",
        "bags" => "Mochilas y Estuches",
        _ => "Otros útiles"
    };
}
