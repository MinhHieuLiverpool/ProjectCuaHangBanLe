// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        public SuppliersController(IRepository<Supplier> supplierRepository)
        {
            _supplierRepository = supplierRepository;
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

        [HttpDelete("{id}")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được xóa
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _supplierRepository.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Supplier deleted successfully" });
        }
    }
}
