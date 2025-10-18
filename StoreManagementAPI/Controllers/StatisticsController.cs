using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Services;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        /// <summary>
        /// Get dashboard overview statistics
        /// </summary>
        /// <param name="days">Number of days for historical data (default: 30)</param>
        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardStatisticsDto>> GetDashboardStatistics([FromQuery] int days = 30)
        {
            try
            {
                var statistics = await _statisticsService.GetDashboardStatisticsAsync(days);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed sales report
        /// </summary>
        /// <param name="startDate">Start date for report (optional, defaults to 1 month ago)</param>
        /// <param name="endDate">End date for report (optional, defaults to today)</param>
        [HttpGet("sales-report")]
        public async Task<ActionResult<SalesReportDto>> GetSalesReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var report = await _statisticsService.GetSalesReportAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get inventory statistics
        /// </summary>
        /// <param name="lowStockThreshold">Threshold for low stock alert (default: 10)</param>
        [HttpGet("inventory")]
        public async Task<ActionResult<InventoryStatisticsDto>> GetInventoryStatistics(
            [FromQuery] int lowStockThreshold = 10)
        {
            try
            {
                var statistics = await _statisticsService.GetInventoryStatisticsAsync(lowStockThreshold);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get customer statistics
        /// </summary>
        [HttpGet("customers")]
        public async Task<ActionResult<CustomerStatisticsDto>> GetCustomerStatistics()
        {
            try
            {
                var statistics = await _statisticsService.GetCustomerStatisticsAsync();
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
