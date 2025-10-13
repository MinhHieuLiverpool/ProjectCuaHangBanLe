// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Services;

namespace StoreManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] - B? AUTHENTICATION
    public class WarehousesController : ControllerBase
    {
        private readonly IWarehouseService _warehouseService;

        public WarehousesController(IWarehouseService warehouseService)
        {
            _warehouseService = warehouseService;
        }

        [HttpGet]
        public async Task<ActionResult<List<WarehouseDto>>> GetAllWarehouses()
        {
            try
            {
                var warehouses = await _warehouseService.GetAllWarehouses();
                return Ok(warehouses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách kho hàng", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WarehouseDto>> GetWarehouseById(int id)
        {
            try
            {
                var warehouse = await _warehouseService.GetWarehouseById(id);
                if (warehouse == null)
                    return NotFound(new { message = "Không tìm thấy kho hàng" });

                return Ok(warehouse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin kho hàng", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<WarehouseDto>> CreateWarehouse([FromBody] WarehouseDto dto)
        {
            try
            {
                var warehouse = await _warehouseService.CreateWarehouse(dto);
                return CreatedAtAction(nameof(GetWarehouseById), new { id = warehouse.WarehouseId }, warehouse);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi tạo kho hàng", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<WarehouseDto>> UpdateWarehouse(int id, [FromBody] WarehouseDto dto)
        {
            try
            {
                var warehouse = await _warehouseService.UpdateWarehouse(id, dto);
                return Ok(warehouse);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi cập nhật kho hàng", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteWarehouse(int id)
        {
            try
            {
                var result = await _warehouseService.DeleteWarehouse(id);
                if (!result)
                    return NotFound(new { message = "Không tìm thấy kho hàng" });

                return Ok(new { message = "Xóa kho hàng thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa kho hàng", error = ex.Message });
            }
        }
    }
}
