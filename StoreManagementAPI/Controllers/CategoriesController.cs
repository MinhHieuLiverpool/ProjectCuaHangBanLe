using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoreManagementAPI.Models;
using StoreManagementAPI.Repositories;

namespace StoreManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu đăng nhập, không giới hạn role
    public class CategoriesController : ControllerBase
    {
        private readonly IRepository<Category> _categoryRepository;

        public CategoriesController(IRepository<Category> categoryRepository)
        {
            _categoryRepository = categoryRepository;
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
        [Authorize(Roles = "admin")] // Chỉ admin mới được tạo mới
        public async Task<ActionResult<Category>> Create([FromBody] Category category)
        {
            var created = await _categoryRepository.AddAsync(category);
            return CreatedAtAction(nameof(GetById), new { id = created.CategoryId }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")] // Chỉ admin mới được cập nhật
        public async Task<ActionResult<Category>> Update(int id, [FromBody] Category category)
        {
            var existing = await _categoryRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.CategoryName = category.CategoryName;

            var updated = await _categoryRepository.UpdateAsync(existing);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")] // Chỉ admin mới được xóa
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _categoryRepository.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Category deleted successfully" });
        }
    }
}
