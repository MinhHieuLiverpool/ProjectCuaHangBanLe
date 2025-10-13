// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.DTOs;
using StoreManagementAPI.Services;
using System.Security.Claims;

namespace StoreManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] - B? AUTHENTICATION
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly IPurchaseOrderService _purchaseOrderService;

        public PurchaseOrdersController(IPurchaseOrderService purchaseOrderService)
        {
            _purchaseOrderService = purchaseOrderService;
        }

        [HttpGet]
        public async Task<ActionResult<List<PurchaseOrderResponseDto>>> GetAllPurchaseOrders()
        {
            try
            {
                var purchaseOrders = await _purchaseOrderService.GetAllPurchaseOrders();
                return Ok(purchaseOrders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách phiếu nhập hàng", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderResponseDto>> GetPurchaseOrderById(int id)
        {
            try
            {
                var purchaseOrder = await _purchaseOrderService.GetPurchaseOrderById(id);
                if (purchaseOrder == null)
                    return NotFound(new { message = "Không tìm thấy phiếu nhập hàng" });

                return Ok(purchaseOrder);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin phiếu nhập hàng", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<PurchaseOrderResponseDto>> CreatePurchaseOrder([FromBody] CreatePurchaseOrderDto dto)
        {
            try
            {
                // BỎ AUTHENTICATION - dùng userId mặc định = 1
                int userId = 1;
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null)
                {
                    userId = int.Parse(userIdClaim.Value);
                }

                var purchaseOrder = await _purchaseOrderService.CreatePurchaseOrder(dto, userId);
                return CreatedAtAction(nameof(GetPurchaseOrderById), new { id = purchaseOrder.PurchaseId }, purchaseOrder);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi tạo phiếu nhập hàng", error = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<PurchaseOrderResponseDto>> UpdatePurchaseOrderStatus(int id, [FromBody] UpdatePurchaseOrderStatusDto dto)
        {
            try
            {
                var purchaseOrder = await _purchaseOrderService.UpdatePurchaseOrderStatus(id, dto.Status);
                return Ok(purchaseOrder);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi cập nhật trạng thái phiếu nhập hàng", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePurchaseOrder(int id)
        {
            try
            {
                var result = await _purchaseOrderService.DeletePurchaseOrder(id);
                if (!result)
                    return NotFound(new { message = "Không tìm thấy phiếu nhập hàng" });

                return Ok(new { message = "Xóa phiếu nhập hàng thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa phiếu nhập hàng", error = ex.Message });
            }
        }
    }
}
