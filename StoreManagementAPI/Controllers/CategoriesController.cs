// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.DTOs;
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

        // Endpoint mới: Lấy danh sách sản phẩm theo category
        [HttpGet("{id}/products")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByCategory(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return NotFound();

            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.CategoryId == id && p.Status != "deleted")
                .Select(p => new ProductDto
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.CategoryName : null,
                    Status = p.Status
                })
                .ToListAsync();

            return Ok(products);
        }

        // Endpoint mới: Kiểm tra trước khi ẩn
        [HttpGet("{id}/check-hide")]
        public async Task<ActionResult<CategoryDeleteResponseDto>> CheckHide(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return NotFound();

            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.CategoryId == id && p.Status != "deleted")
                .Select(p => new ProductDto
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.CategoryName : null,
                    Status = p.Status
                })
                .ToListAsync();

            return Ok(new CategoryDeleteResponseDto
            {
                Success = true,
                Message = products.Count > 0
                    ? $"Danh mục có {products.Count} sản phẩm đang hoạt động"
                    : "Danh mục không có sản phẩm",
                SoftDeleted = false,
                CategoryId = id,
                AffectedProducts = products,
                ProductCount = products.Count
            });
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
        // [Authorize]
        public async Task<ActionResult<Category>> Create([FromBody] Category category)
        {
            // 🔍 Kiểm tra trùng tên (không phân biệt hoa thường)
            var exists = await _categoryRepository.FindAsync(c =>
                c.CategoryName.ToLower() == category.CategoryName.ToLower());
            if (exists.Any())
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Tên danh mục đã tồn tại."
                });
            }

            var created = await _categoryRepository.AddAsync(category);

            // 🧾 Ghi log audit
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
                Console.WriteLine($"Audit log error: {ex.Message}");
            }

            return CreatedAtAction(nameof(GetById), new { id = created.CategoryId }, created);
        }

        [HttpPut("{id}")]
        // [Authorize]
        public async Task<ActionResult<Category>> Update(int id, [FromBody] Category category)
        {
            var existing = await _categoryRepository.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "Không tìm thấy danh mục." });

            // 🔍 Kiểm tra trùng tên (loại trừ chính nó)
            var duplicate = await _categoryRepository.FindAsync(c =>
                c.CategoryId != id && c.CategoryName.ToLower() == category.CategoryName.ToLower());
            if (duplicate.Any())
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Tên danh mục đã tồn tại."
                });
            }

            var oldValues = new
            {
                existing.CategoryId,
                existing.CategoryName,
                existing.Status
            };

            var oldName = existing.CategoryName;
            existing.CategoryName = category.CategoryName;

            var updated = await _categoryRepository.UpdateAsync(existing);

            // 🧾 Ghi log audit
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

        // Endpoint ẩn danh mục (soft delete only)
        [HttpPatch("{id}/hide")]
        public async Task<ActionResult<CategoryDeleteResponseDto>> Hide(int id, [FromBody] CategoryDeleteRequestDto? request = null)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return NotFound();

            var oldValues = new
            {
                category.CategoryId,
                category.CategoryName,
                category.Status
            };

            // Lấy danh sách sản phẩm đang hoạt động trong category
            var activeProducts = await _context.Products
                .Where(p => p.CategoryId == id && p.Status != "deleted")
                .ToListAsync();

            // Xử lý reassign sản phẩm nếu có (map productId -> newCategoryId)
            if (request != null && request.ProductCategoryMap != null && request.ProductCategoryMap.Count > 0)
            {
                // Validate tất cả category mới
                var newCategoryIds = request.ProductCategoryMap.Values.Distinct().ToList();
                var newCategories = await _context.Categories
                    .Where(c => newCategoryIds.Contains(c.CategoryId))
                    .ToListAsync();

                // Kiểm tra tất cả category có tồn tại không
                if (newCategories.Count != newCategoryIds.Count)
                {
                    return BadRequest(new CategoryDeleteResponseDto
                    {
                        Success = false,
                        Message = "Một hoặc nhiều danh mục mới không tồn tại",
                        SoftDeleted = false,
                        CategoryId = id,
                        ProductCount = 0
                    });
                }

                // Kiểm tra tất cả category có active không
                if (newCategories.Any(c => c.Status != "active"))
                {
                    return BadRequest(new CategoryDeleteResponseDto
                    {
                        Success = false,
                        Message = "Một hoặc nhiều danh mục mới không ở trạng thái hoạt động",
                        SoftDeleted = false,
                        CategoryId = id,
                        ProductCount = 0
                    });
                }

                // Reassign các sản phẩm theo map
                foreach (var mapping in request.ProductCategoryMap)
                {
                    var productId = mapping.Key;
                    var newCategoryId = mapping.Value;

                    var product = activeProducts.FirstOrDefault(p => p.ProductId == productId);
                    if (product != null)
                    {
                        var oldCategoryId = product.CategoryId;
                        var newCategory = newCategories.First(c => c.CategoryId == newCategoryId);

                        product.CategoryId = newCategoryId;
                        _context.Products.Update(product);

                        // Log audit cho mỗi sản phẩm được đổi
                        LogAudit(
                            action: "UPDATE",
                            entity: "Product",
                            entityId: product.ProductId,
                            entityName: product.ProductName,
                            changesSummary: $"Chuyển sản phẩm từ danh mục {category.CategoryName} sang {newCategory.CategoryName}",
                            oldValues: new { CategoryId = oldCategoryId },
                            newValues: new { CategoryId = newCategoryId }
                        );
                    }
                }

                await _context.SaveChangesAsync();

                // Cập nhật lại danh sách sản phẩm còn lại
                activeProducts = await _context.Products
                    .Where(p => p.CategoryId == id && p.Status != "deleted")
                    .ToListAsync();
            }

            // Ẩn các sản phẩm còn lại nếu được yêu cầu
            if (request != null && request.HideProducts && activeProducts.Count > 0)
            {
                foreach (var product in activeProducts)
                {
                    product.Status = "inactive";
                    _context.Products.Update(product);

                    // Log audit
                    LogAudit(
                        action: "UPDATE",
                        entity: "Product",
                        entityId: product.ProductId,
                        entityName: product.ProductName,
                        changesSummary: $"Ẩn sản phẩm do ẩn danh mục {category.CategoryName}",
                        oldValues: new { Status = "active" },
                        newValues: new { Status = "inactive" }
                    );
                }

                await _context.SaveChangesAsync();
            }

            // Luôn luôn chỉ ẩn category (soft delete), không xóa hẳn
            category.Status = "inactive";
            await _categoryRepository.UpdateAsync(category);

            LogAudit(
                action: "HIDE",
                entity: "Category",
                entityId: id,
                entityName: category.CategoryName,
                changesSummary: $"Ẩn danh mục: {category.CategoryName}",
                oldValues: oldValues,
                newValues: new { category.Status }
            );

            return Ok(new CategoryDeleteResponseDto
            {
                Success = true,
                Message = "Đã ẩn danh mục thành công",
                SoftDeleted = true,
                CategoryId = id,
                ProductCount = activeProducts.Count
            });
        }

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Category>>> Filter(
            [FromQuery] string? search = null,
            [FromQuery] string? status = "all")
        {
            var query = _context.Categories.AsQueryable();

            // Lọc theo trạng thái
            if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
            {
                query = query.Where(c => c.Status.ToLower() == status.ToLower());
            }

            // Tìm kiếm theo tên
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => c.CategoryName.Contains(search));
            }

            var categories = await query
                .OrderByDescending(c => c.CategoryId)
                .ToListAsync();

            return Ok(categories);
        }


    }
}
