// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize] - B? AUTHENTICATION // Yêu cầu đăng nhập, nhưng không giới hạn role
    public class SuppliersController : ControllerBase
    {
        private readonly IRepository<Supplier> _supplierRepository;
        private readonly StoreDbContext _context;

        public SuppliersController(IRepository<Supplier> supplierRepository, StoreDbContext context)
        {
            _supplierRepository = supplierRepository;
            _context = context;
        }

        [HttpGet]
        // Staff và Admin đều có thể đọc danh sách nhà cung cấp
        public async Task<ActionResult<IEnumerable<Supplier>>> GetAll()
        {
            var suppliers = await _supplierRepository.GetAllAsync();
            return Ok(suppliers);
        }

        [HttpGet("{id}")]
        // Staff và Admin đều có thể đọc chi tiết nhà cung cấp
        public async Task<ActionResult<Supplier>> GetById(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null) return NotFound();
            return Ok(supplier);
        }

        [HttpPost]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được tạo mới
        public async Task<ActionResult<Supplier>> Create([FromBody] Supplier supplier)
        {
            var created = await _supplierRepository.AddAsync(supplier);
            return CreatedAtAction(nameof(GetById), new { id = created.SupplierId }, created);
        }

        [HttpPut("{id}")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được cập nhật
        public async Task<ActionResult<Supplier>> Update(int id, [FromBody] Supplier supplier)
        {
            var existing = await _supplierRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.Name = supplier.Name;
            existing.Phone = supplier.Phone;
            existing.Email = supplier.Email;
            existing.Address = supplier.Address;

            var updated = await _supplierRepository.UpdateAsync(existing);
            return Ok(updated);
        }

        [HttpPatch("{id}/restore")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được khôi phục
        public async Task<ActionResult> Restore(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null) return NotFound();

            supplier.Status = "active";
            var updated = await _supplierRepository.UpdateAsync(supplier);
            return Ok(new 
            { 
                message = "Khôi phục nhà cung cấp thành công",
                supplier = updated
            });
        }

        [HttpDelete("{id}")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được xóa
        public async Task<ActionResult> Delete(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null) return NotFound();

            // Kiểm tra xem có sản phẩm hoặc đơn nhập hàng nào đang sử dụng supplier này không
            var hasProducts = await _context.Products
                .AnyAsync(p => p.SupplierId == id && p.Status != "deleted");
            
            var hasPurchaseOrders = await _context.PurchaseOrders
                .AnyAsync(po => po.SupplierId == id && po.Status != "deleted");

            if (hasProducts || hasPurchaseOrders)
            {
                // Có liên quan -> chỉ ẩn đi (soft delete)
                supplier.Status = "inactive";
                await _supplierRepository.UpdateAsync(supplier);
                return Ok(new 
                { 
                    message = "Nhà cung cấp có dữ liệu liên quan nên đã được ẩn thay vì xóa",
                    softDeleted = true,
                    supplierId = id
                });
            }
            else
            {
                // Không có liên quan -> xóa hẳn
                var result = await _supplierRepository.DeleteAsync(id);
                if (!result) return NotFound();
                return Ok(new 
                { 
                    message = "Đã xóa nhà cung cấp thành công",
                    softDeleted = false,
                    supplierId = id
                });
            }
        }
    }
}
