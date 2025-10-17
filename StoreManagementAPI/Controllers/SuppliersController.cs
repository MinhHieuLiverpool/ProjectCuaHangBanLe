// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;
using System.Text.Json;

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

        private void LogAudit(string action, string entity, int? entityId, string? entityName, string changesSummary, object? oldValues, object? newValues)
        {
            var auditLog = new AuditLog
            {
                Action = action,
                EntityType = entity,
                EntityId = entityId,
                EntityName = entityName,
                ChangesSummary = changesSummary,
                OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                CreatedAt = DateTime.Now,
                UserId = 1,
                Username = "admin"
            };

            _context.AuditLogs.Add(auditLog);
            _context.SaveChanges();
        }

        [HttpGet]
        // Staff và Admin đều có thể đọc danh sách nhà cung cấp
        public async Task<ActionResult<IEnumerable<Supplier>>> GetAll()
        {
            var suppliers = await _supplierRepository.GetAllAsync();
            return Ok(suppliers);
        }

        // Endpoint kiểm tra supplier có thể xóa hẳn không
        [HttpGet("{id}/can-delete")]
        public async Task<ActionResult<object>> CanDelete(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null) return NotFound();

            var hasProducts = await _context.Products
                .AnyAsync(p => p.SupplierId == id && p.Status != "deleted");

            var hasPurchaseOrders = await _context.PurchaseOrders
                .AnyAsync(po => po.SupplierId == id && po.Status != "deleted");

            var canHardDelete = !hasProducts && !hasPurchaseOrders;

            return Ok(new
            {
                canHardDelete,
                hasProducts,
                hasPurchaseOrders,
                message = canHardDelete
                    ? "Có thể xóa nhà cung cấp"
                    : "Nhà cung cấp có dữ liệu liên quan, chỉ có thể ẩn"
            });
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
            
            // Log audit
            LogAudit(
                action: "CREATE",
                entity: "Supplier",
                entityId: created.SupplierId,
                entityName: created.Name,
                changesSummary: $"Tạo nhà cung cấp mới: {created.Name} (SĐT: {created.Phone})",
                oldValues: null,
                newValues: new
                {
                    created.SupplierId,
                    created.Name,
                    created.Phone,
                    created.Email,
                    created.Address,
                    created.Status
                }
            );
            
            return CreatedAtAction(nameof(GetById), new { id = created.SupplierId }, created);
        }

        [HttpPut("{id}")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được cập nhật
        public async Task<ActionResult<Supplier>> Update(int id, [FromBody] Supplier supplier)
        {
            var existing = await _supplierRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            var oldValues = new
            {
                existing.SupplierId,
                existing.Name,
                existing.Phone,
                existing.Email,
                existing.Address,
                existing.Status
            };

            var oldName = existing.Name;
            existing.Name = supplier.Name;
            existing.Phone = supplier.Phone;
            existing.Email = supplier.Email;
            existing.Address = supplier.Address;

            var updated = await _supplierRepository.UpdateAsync(existing);
            
            // Log audit
            LogAudit(
                action: "UPDATE",
                entity: "Supplier",
                entityId: id,
                entityName: updated.Name,
                changesSummary: $"Cập nhật nhà cung cấp: {oldName} → {updated.Name}",
                oldValues: oldValues,
                newValues: new
                {
                    updated.SupplierId,
                    updated.Name,
                    updated.Phone,
                    updated.Email,
                    updated.Address,
                    updated.Status
                }
            );
            
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

            LogAudit(
                action: "RESTORE",
                entity: "Supplier",
                entityId: id,
                entityName: supplier.Name,
                changesSummary: $"Khôi phục nhà cung cấp: {supplier.Name}",
                oldValues: new { Status = "inactive" },
                newValues: new { Status = "active" }
            );

            return Ok(new
            {
                message = "Khôi phục nhà cung cấp thành công",
                supplier = updated
            });
        }

        [HttpPatch("{id}/hide")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được ẩn
        public async Task<ActionResult> Hide(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null) return NotFound();

            var oldValues = new
            {
                supplier.SupplierId,
                supplier.Name,
                supplier.Status
            };

            supplier.Status = "inactive";
            var updated = await _supplierRepository.UpdateAsync(supplier);

            LogAudit(
                action: "HIDE",
                entity: "Supplier",
                entityId: id,
                entityName: supplier.Name,
                changesSummary: $"Ẩn nhà cung cấp: {supplier.Name}",
                oldValues: oldValues,
                newValues: new { supplier.Status }
            );

            return Ok(new
            {
                message = "Đã ẩn nhà cung cấp thành công",
                supplier = updated
            });
        }

        [HttpDelete("{id}")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được xóa
        public async Task<ActionResult> Delete(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null) return NotFound();

            var deletedValues = new
            {
                supplier.SupplierId,
                supplier.Name,
                supplier.Phone,
                supplier.Email,
                supplier.Address,
                supplier.Status
            };

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
                
                // Log audit
                LogAudit(
                    action: "DELETE",
                    entity: "Supplier",
                    entityId: id,
                    entityName: supplier.Name,
                    changesSummary: $"Ẩn nhà cung cấp (có dữ liệu liên quan): {supplier.Name}",
                    oldValues: deletedValues,
                    newValues: new { supplier.Status }
                );
                
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
                
                // Log audit
                LogAudit(
                    action: "DELETE",
                    entity: "Supplier",
                    entityId: id,
                    entityName: supplier.Name,
                    changesSummary: $"Xóa nhà cung cấp: {supplier.Name}",
                    oldValues: deletedValues,
                    newValues: null
                );
                
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
