namespace IdeasRestApi.DTOs;

public class DashboardMetricsDto
{
    public int TotalProducts { get; set; }
    public decimal MonthlySalesTotal { get; set; }
    public decimal DailySalesTotal { get; set; }
    public int LowStockProductsCount { get; set; }
    public List<SaleDto> RecentSales { get; set; } = new();
}
