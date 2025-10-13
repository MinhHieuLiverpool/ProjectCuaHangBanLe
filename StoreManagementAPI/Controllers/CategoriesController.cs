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
            return CreatedAtAction(nameof(GetById), new { id = created.CategoryId }, created);
        }

        [HttpPut("{id}")]
        // [Authorize] - B? AUTHENTICATION // Chỉ admin mới được cập nhật
        public async Task<ActionResult<Category>> Update(int id, [FromBody] Category category)
        {
            var existing = await _categoryRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.CategoryName = category.CategoryName;

            var updated = await _categoryRepository.UpdateAsync(existing);
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

            // Kiểm tra xem có sản phẩm nào đang sử dụng category này không
            var hasProducts = await _context.Products
                .AnyAsync(p => p.CategoryId == id && p.Status != "deleted");

            if (hasProducts)
            {
                // Có sản phẩm liên quan -> chỉ ẩn đi (soft delete)
                category.Status = "inactive";
                await _categoryRepository.UpdateAsync(category);
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
