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
    // [Authorize] - B? AUTHENTICATION // Yêu cầu đăng nhập, không giới hạn role
    public class CategoriesController : ControllerBase
    {
        private readonly IRepository<Category> _categoryRepository;
        private readonly StoreDbContext _context;

        public CategoriesController(IRepository<Category> categoryRepository, StoreDbContext context)
        {
            _categoryRepository = categoryRepository;
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
        // Tất cả user đều có thể đọc danh mục
        public async Task<ActionResult<IEnumerable<Category>>> GetAll()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        // Tất cả user đều có thể đọc chi tiết danh mục
        public async Task<ActionResult<Category>> GetById(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return NotFound();
            return Ok(category);
        }

        [HttpPost]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được tạo mới
        public async Task<ActionResult<Category>> Create([FromBody] Category category)
        {
            var created = await _categoryRepository.AddAsync(category);
            
            // Log audit
            try
            {
                LogAudit(
                    action: "CREATE",
                    entity: "Category",
                    entityId: created.CategoryId,
                    entityName: created.CategoryName,
                    changesSummary: $"Tạo danh mục mới: {created.CategoryName}",
                    oldValues: null,
                    newValues: new
                    {
                        created.CategoryId,
                        created.CategoryName,
                        created.Status
                    }
                );
            }
            catch (Exception ex)
            {
                // Log error nhưng vẫn trả về kết quả thành công
                Console.WriteLine($"Audit log error: {ex.Message}");
            }
            
            return CreatedAtAction(nameof(GetById), new { id = created.CategoryId }, created);
        }

        [HttpPut("{id}")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được cập nhật
        public async Task<ActionResult<Category>> Update(int id, [FromBody] Category category)
        {
            var existing = await _categoryRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            var oldValues = new
            {
                existing.CategoryId,
                existing.CategoryName,
                existing.Status
            };

            var oldName = existing.CategoryName;
            existing.CategoryName = category.CategoryName;

            var updated = await _categoryRepository.UpdateAsync(existing);
            
            // Log audit
            LogAudit(
                action: "UPDATE",
                entity: "Category",
                entityId: id,
                entityName: updated.CategoryName,
                changesSummary: $"Cập nhật danh mục: {oldName} → {updated.CategoryName}",
                oldValues: oldValues,
                newValues: new
                {
                    updated.CategoryId,
                    updated.CategoryName,
                    updated.Status
                }
            );
            
            return Ok(updated);
        }

        [HttpPatch("{id}/restore")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được khôi phục
        public async Task<ActionResult> Restore(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return NotFound();

            category.Status = "active";
            var updated = await _categoryRepository.UpdateAsync(category);
            return Ok(new 
            { 
                message = "Khôi phục danh mục thành công",
                category = updated
            });
        }

        [HttpDelete("{id}")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được xóa
        public async Task<ActionResult> Delete(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return NotFound();

            var deletedValues = new
            {
                category.CategoryId,
                category.CategoryName,
                category.Status
            };

            // Kiểm tra xem có sản phẩm nào đang sử dụng category này không
            var hasProducts = await _context.Products
                .AnyAsync(p => p.CategoryId == id && p.Status != "deleted");

            if (hasProducts)
            {
                // Có sản phẩm liên quan -> chỉ ẩn đi (soft delete)
                category.Status = "inactive";
                await _categoryRepository.UpdateAsync(category);
                
                // Log audit
                LogAudit(
                    action: "DELETE",
                    entity: "Category",
                    entityId: id,
                    entityName: category.CategoryName,
                    changesSummary: $"Ẩn danh mục (có sản phẩm liên quan): {category.CategoryName}",
                    oldValues: deletedValues,
                    newValues: new { category.Status }
                );
                
                return Ok(new 
                { 
                    message = "Danh mục có sản phẩm liên quan nên đã được ẩn thay vì xóa",
                    softDeleted = true,
                    categoryId = id
                });
            }
            else
            {
                // Không có sản phẩm liên quan -> xóa hẳn
                var result = await _categoryRepository.DeleteAsync(id);
                if (!result) return NotFound();
                
                // Log audit
                LogAudit(
                    action: "DELETE",
                    entity: "Category",
                    entityId: id,
                    entityName: category.CategoryName,
                    changesSummary: $"Xóa danh mục: {category.CategoryName}",
                    oldValues: deletedValues,
                    newValues: null
                );
                
                return Ok(new 
                { 
                    message = "Đã xóa danh mục thành công",
                    softDeleted = false,
                    categoryId = id
                });
            }
        }
    }
}
