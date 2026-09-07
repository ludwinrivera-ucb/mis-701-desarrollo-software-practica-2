using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IdeasRestApi.Data;
using IdeasRestApi.DTOs;
using IdeasRestApi.Models;

namespace IdeasRestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SalesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SaleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] int? productId)
    {
        var query = _context.Sales
            .Include(s => s.Product)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(s => s.Status.ToLower() == status.Trim().ToLower());
        }

        if (productId.HasValue && productId.Value > 0)
        {
            query = query.Where(s => s.ProductId == productId.Value);
        }

        var sales = await query
            .OrderByDescending(s => s.Date)
            .ThenByDescending(s => s.Id)
            .Select(s => MapToDto(s))
            .ToListAsync();

        return Ok(sales);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SaleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var sale = await _context.Sales
            .Include(s => s.Product)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale == null)
        {
            return NotFound(new { message = $"Venta con ID {id} no encontrada." });
        }

        return Ok(MapToDto(sale));
    }

    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(SaleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateSaleDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null)
        {
            return BadRequest(new { message = $"El producto seleccionado (ID: {dto.ProductId}) no existe." });
        }

        if (product.Stock < dto.Quantity)
        {
            return BadRequest(new
            {
                message = $"Stock insuficiente para '{product.Name}'. Stock actual disponible: {product.Stock}, solicitado: {dto.Quantity}."
            });
        }

        // Descontar stock del producto
        product.Stock -= dto.Quantity;

        var unitPrice = dto.UnitPrice ?? product.Price;
        var total = dto.Quantity * unitPrice;
        var status = string.IsNullOrWhiteSpace(dto.Status) ? "ok" : dto.Status.Trim();
        var statusLabel = string.IsNullOrWhiteSpace(dto.StatusLabel) ? GetStatusLabel(status) : dto.StatusLabel.Trim();

        var sale = new Sale
        {
            ProductId = product.Id,
            Quantity = dto.Quantity,
            UnitPrice = unitPrice,
            Total = total,
            Date = dto.Date ?? DateTime.UtcNow,
            Status = status,
            StatusLabel = statusLabel,
            Customer = dto.Customer?.Trim() ?? string.Empty,
            PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "efectivo" : dto.PaymentMethod.Trim(),
            Notes = dto.Notes?.Trim() ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        _context.Sales.Add(sale);
        await _context.SaveChangesAsync();

        sale.Product = product;
        var resultDto = MapToDto(sale);

        return CreatedAtAction(nameof(GetById), new { id = sale.Id }, resultDto);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(SaleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSaleDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var sale = await _context.Sales
            .Include(s => s.Product)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale == null)
        {
            return NotFound(new { message = $"Venta con ID {id} no encontrada." });
        }

        // Si cambió el producto vinculado
        if (sale.ProductId != dto.ProductId)
        {
            var newProduct = await _context.Products.FindAsync(dto.ProductId);
            if (newProduct == null)
            {
                return BadRequest(new { message = $"El nuevo producto seleccionado (ID: {dto.ProductId}) no existe." });
            }

            if (newProduct.Stock < dto.Quantity)
            {
                return BadRequest(new
                {
                    message = $"Stock insuficiente en el nuevo producto '{newProduct.Name}'. Stock actual: {newProduct.Stock}, solicitado: {dto.Quantity}."
                });
            }

            // Restituir stock al producto anterior
            if (sale.Product != null)
            {
                sale.Product.Stock += sale.Quantity;
            }

            // Descontar stock del nuevo producto
            newProduct.Stock -= dto.Quantity;
            sale.ProductId = newProduct.Id;
            sale.Product = newProduct;
        }
        else
        {
            // Mismo producto: ajustar la diferencia de stock
            var quantityDifference = dto.Quantity - sale.Quantity;

            if (quantityDifference > 0)
            {
                if (sale.Product != null && sale.Product.Stock < quantityDifference)
                {
                    return BadRequest(new
                    {
                        message = $"Stock adicional insuficiente para '{sale.Product.Name}'. Stock disponible: {sale.Product.Stock}, adicional requerido: {quantityDifference}."
                    });
                }

                if (sale.Product != null)
                {
                    sale.Product.Stock -= quantityDifference;
                }
            }
            else if (quantityDifference < 0)
            {
                if (sale.Product != null)
                {
                    sale.Product.Stock += Math.Abs(quantityDifference);
                }
            }
        }

        var status = string.IsNullOrWhiteSpace(dto.Status) ? "ok" : dto.Status.Trim();
        var statusLabel = string.IsNullOrWhiteSpace(dto.StatusLabel) ? GetStatusLabel(status) : dto.StatusLabel.Trim();

        sale.Quantity = dto.Quantity;
        sale.UnitPrice = dto.UnitPrice;
        sale.Total = dto.Quantity * dto.UnitPrice;
        sale.Date = dto.Date ?? sale.Date;
        sale.Status = status;
        sale.StatusLabel = statusLabel;
        sale.Customer = dto.Customer?.Trim() ?? string.Empty;
        sale.PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "efectivo" : dto.PaymentMethod.Trim();
        sale.Notes = dto.Notes?.Trim() ?? string.Empty;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(sale));
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(int id)
    {
        var sale = await _context.Sales
            .Include(s => s.Product)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sale == null)
        {
            return NotFound(new { message = $"Venta con ID {id} no encontrada." });
        }

        // Restituir stock al producto al anular o eliminar la venta
        if (sale.Product != null)
        {
            sale.Product.Stock += sale.Quantity;
        }

        _context.Sales.Remove(sale);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static SaleDto MapToDto(Sale sale)
    {
        return new SaleDto
        {
            Id = sale.Id,
            ProductId = sale.ProductId,
            ProductName = sale.Product?.Name ?? "Producto no especificado",
            ProductSku = sale.Product?.Sku ?? string.Empty,
            Quantity = sale.Quantity,
            UnitPrice = sale.UnitPrice,
            Total = sale.Total,
            Date = sale.Date,
            FormattedDate = sale.Date.ToString("dd/MM/yyyy"),
            Status = sale.Status,
            StatusLabel = string.IsNullOrWhiteSpace(sale.StatusLabel) ? GetStatusLabel(sale.Status) : sale.StatusLabel,
            Customer = sale.Customer,
            PaymentMethod = sale.PaymentMethod,
            Notes = sale.Notes,
            CreatedAt = sale.CreatedAt
        };
    }

    private static string GetStatusLabel(string status) => status.ToLower() switch
    {
        "ok" => "Pagado",
        "warn" => "En proceso",
        "danger" => "Pendiente",
        _ => "Pagado"
    };
}
