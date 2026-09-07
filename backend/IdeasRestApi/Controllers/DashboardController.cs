using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IdeasRestApi.Data;
using IdeasRestApi.DTOs;

namespace IdeasRestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(DashboardMetricsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMetrics()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfDay = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);

        var totalProducts = await _context.Products.CountAsync();

        var monthlySalesTotal = await _context.Sales
            .Where(s => s.Date >= startOfMonth)
            .SumAsync(s => (decimal?)s.Total) ?? 0m;

        var dailySalesTotal = await _context.Sales
            .Where(s => s.Date >= startOfDay)
            .SumAsync(s => (decimal?)s.Total) ?? 0m;

        var lowStockCount = await _context.Products
            .CountAsync(p => p.Stock <= p.MinStock);

        var recentSales = await _context.Sales
            .Include(s => s.Product)
            .OrderByDescending(s => s.Date)
            .ThenByDescending(s => s.Id)
            .Take(5)
            .Select(s => new SaleDto
            {
                Id = s.Id,
                ProductId = s.ProductId,
                ProductName = s.Product != null ? s.Product.Name : "Producto no especificado",
                ProductSku = s.Product != null ? s.Product.Sku : string.Empty,
                Quantity = s.Quantity,
                UnitPrice = s.UnitPrice,
                Total = s.Total,
                Date = s.Date,
                FormattedDate = s.Date.ToString("dd/MM/yyyy"),
                Status = s.Status,
                StatusLabel = s.StatusLabel,
                Customer = s.Customer,
                PaymentMethod = s.PaymentMethod,
                Notes = s.Notes,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();

        var metrics = new DashboardMetricsDto
        {
            TotalProducts = totalProducts,
            MonthlySalesTotal = monthlySalesTotal,
            DailySalesTotal = dailySalesTotal,
            LowStockProductsCount = lowStockCount,
            RecentSales = recentSales
        };

        return Ok(metrics);
    }
}
