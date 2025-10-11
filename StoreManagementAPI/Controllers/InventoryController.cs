// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Services;

namespace StoreManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] - B? AUTHENTICATION
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet]
        public async Task<ActionResult<List<InventoryResponseDto>>> GetAllInventory()
        {
            try
            {
                var inventories = await _inventoryService.GetAllInventory();
                return Ok(inventories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách tồn kho", error = ex.Message });
            }
        }

        [HttpGet("warehouse/{warehouseId}")]
        public async Task<ActionResult<List<InventoryResponseDto>>> GetInventoryByWarehouse(int warehouseId)
        {
            try
            {
                var inventories = await _inventoryService.GetInventoryByWarehouse(warehouseId);
                return Ok(inventories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy tồn kho theo kho", error = ex.Message });
            }
        }

        [HttpPost("add-stock")]
        public async Task<ActionResult<InventoryResponseDto>> AddStock([FromBody] StockReceiptDto dto)
        {
            try
            {
                var inventory = await _inventoryService.AddStock(dto);
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
